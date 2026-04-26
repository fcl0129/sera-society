import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LogOut, Plus, Calendar, Users, Ticket, ScanLine, Trash2, Mail, Link2, Pencil, Check, X, Clock, Ban, Send, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CreateEventFlow } from "@/components/organizer/CreateEventFlow";

const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fmtFull = new Intl.DateTimeFormat(undefined, {
  weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
});

const buildRsvpUrl = (token: string) =>
  `${window.location.origin}/rsvp/${encodeURIComponent(token)}`;

/**
 * Best-effort send of the branded invitation email via the send-sera-email edge function.
 * Failures do NOT block guest creation — organizer always has the manual "copy RSVP link" fallback.
 */
async function sendInvitationEmail(args: {
  to: string;
  rsvpUrl: string;
  passUrl: string;
  eventTitle: string;
  startsAt: string;
  venue: string | null;
  hostName: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-sera-email", {
      body: {
        template: "invitation",
        to: args.to,
        data: {
          event_title: args.eventTitle,
          event_date: fmtFull.format(new Date(args.startsAt)),
          venue: args.venue ?? "",
          rsvp_url: args.rsvpUrl,
          pass_url: args.passUrl,
          host_name: args.hostName ?? "Your host",
          app_url: window.location.origin,
        },
      },
    });
    if (error) return { ok: false, error: error.message };
    if (data && typeof data === "object" && "error" in data && (data as any).error) {
      return { ok: false, error: String((data as any).error) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  description: string | null;
  status: string;
  capacity: number | null;
  enable_qr: boolean;
  enable_nfc: boolean;
};

type GuestRow = {
  id: string;
  invited_email: string;
  full_name: string | null;
  phone_number: string | null;
  rsvp_status: string;
  plus_one_allowed: boolean;
  plus_one_count: number;
  rsvp_message: string | null;
  rsvp_responded_at: string | null;
  rsvp_token: string;
  guest_id: string | null;
};

type TicketRow = {
  id: string;
  status: string;
  guest_id: string | null;
  redeemed_at: string | null;
  token: string;
  event_guest_id: string | null;
};

export default function HostAdminDashboard() {
  const { fullName, email, role } = useAuthState();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Guest form state
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPlusOne, setGuestPlusOne] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GuestRow>>({});

  const eventsQuery = useQuery({
    queryKey: ["org-events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id,title,starts_at,ends_at,venue,description,status,capacity,enable_qr,enable_nfc")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });

  const events = eventsQuery.data ?? [];
  const currentEventId = activeEventId ?? events[0]?.id ?? null;
  const currentEvent = events.find((e) => e.id === currentEventId) ?? null;

  const guestsQuery = useQuery({
    queryKey: ["org-guests", currentEventId],
    enabled: !!currentEventId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_guests")
        .select("id,invited_email,full_name,phone_number,rsvp_status,plus_one_allowed,plus_one_count,rsvp_message,rsvp_responded_at,rsvp_token,guest_id")
        .eq("event_id", currentEventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GuestRow[];
    },
  });

  const ticketsQuery = useQuery({
    queryKey: ["org-tickets", currentEventId],
    enabled: !!currentEventId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("drink_tickets")
        .select("id,status,guest_id,redeemed_at,token,event_guest_id")
        .eq("event_id", currentEventId);
      if (error) throw error;
      return (data ?? []) as TicketRow[];
    },
  });

  const stats = useMemo(() => {
    const guests = guestsQuery.data ?? [];
    const tickets = ticketsQuery.data ?? [];
    return {
      totalGuests: guests.length,
      accepted: guests.filter((g) => g.rsvp_status === "accepted").length,
      declined: guests.filter((g) => g.rsvp_status === "declined").length,
      pending: guests.filter((g) => g.rsvp_status === "pending").length,
      ticketsTotal: tickets.length,
      ticketsRedeemed: tickets.filter((t) => t.status === "redeemed").length,
    };
  }, [guestsQuery.data, ticketsQuery.data]);

  // Map by event_guest_id (preferred, account-agnostic) AND fall back to
  // guest_id (auth uid) for legacy tickets that pre-date event_guest_id.
  const ticketsByEventGuest = useMemo(() => {
    const map = new Map<string, TicketRow[]>();
    for (const t of ticketsQuery.data ?? []) {
      if (!t.event_guest_id) continue;
      const arr = map.get(t.event_guest_id) ?? [];
      arr.push(t);
      map.set(t.event_guest_id, arr);
    }
    return map;
  }, [ticketsQuery.data]);
  const ticketsByGuestUid = useMemo(() => {
    const map = new Map<string, TicketRow[]>();
    for (const t of ticketsQuery.data ?? []) {
      if (!t.guest_id || t.event_guest_id) continue;
      const arr = map.get(t.guest_id) ?? [];
      arr.push(t);
      map.set(t.guest_id, arr);
    }
    return map;
  }, [ticketsQuery.data]);
  const ticketsForGuest = (g: GuestRow): TicketRow[] => {
    const a = ticketsByEventGuest.get(g.id) ?? [];
    const b = g.guest_id ? ticketsByGuestUid.get(g.guest_id) ?? [] : [];
    return [...a, ...b];
  };

  const handleEventCreated = async (eventId: string) => {
    setShowCreate(false);
    if (eventId) setActiveEventId(eventId);
    await qc.invalidateQueries({ queryKey: ["org-events"] });
    toast({ title: "Event composed", description: "Add guests to begin sending invitations." });
  };

  const handlePublishToggle = async () => {
    if (!currentEvent) return;
    const nextStatus = currentEvent.status === "published" ? "draft" : "published";
    const { error } = await (supabase as any)
      .from("events")
      .update({ status: nextStatus })
      .eq("id", currentEvent.id);
    if (!error) await qc.invalidateQueries({ queryKey: ["org-events"] });
  };

  const handleDeleteEvent = async () => {
    if (!currentEvent) return;
    if (!window.confirm(`Delete "${currentEvent.title}"? This cannot be undone.`)) return;
    const { error } = await (supabase as any).from("events").delete().eq("id", currentEvent.id);
    if (!error) {
      setActiveEventId(null);
      await qc.invalidateQueries({ queryKey: ["org-events"] });
    }
  };

  const handleAddGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentEventId || !guestEmail.trim()) return;
    setAddingGuest(true);
    const email = guestEmail.trim().toLowerCase();
    const { data: inserted, error } = await (supabase as any)
      .from("event_guests")
      .insert({
        event_id: currentEventId,
        invited_email: email,
        full_name: guestName.trim() || null,
        phone_number: guestPhone.trim() || null,
        plus_one_allowed: guestPlusOne,
      })
      .select("id, rsvp_token, invited_email, full_name")
      .single();
    if (!error && inserted && currentEvent) {
      setGuestEmail(""); setGuestName(""); setGuestPhone(""); setGuestPlusOne(false);
      await qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] });

      // Best-effort branded invitation email. Manual "copy RSVP link" remains as fallback.
      const rsvpUrl = buildRsvpUrl(inserted.rsvp_token);
      const passUrl = `${window.location.origin}/pass/${encodeURIComponent(inserted.rsvp_token)}`;
      const sendResult = await sendInvitationEmail({
        to: email,
        rsvpUrl,
        passUrl,
        eventTitle: currentEvent.title,
        startsAt: currentEvent.starts_at,
        venue: currentEvent.venue,
        hostName: fullName ?? null,
      });
      if (sendResult.ok) {
        toast({ title: "Guest added", description: `Invitation sent to ${email}` });
      } else {
        toast({
          title: "Guest added — email not sent",
          description: `Use the copy-link icon to share manually. (${sendResult.error ?? "send failed"})`,
        });
      }
    } else if (error) {
      const msg = error.code === "23505"
        ? "This email is already on the guest list for this event."
        : error.message;
      toast({ title: "Could not add guest", description: msg, variant: "destructive" });
    }
    setAddingGuest(false);
  };

  const resendInvitation = async (g: GuestRow) => {
    if (!currentEvent) return;
    const rsvpUrl = buildRsvpUrl(g.rsvp_token);
    const passUrl = `${window.location.origin}/pass/${encodeURIComponent(g.rsvp_token)}`;
    const result = await sendInvitationEmail({
      to: g.invited_email,
      rsvpUrl,
      passUrl,
      eventTitle: currentEvent.title,
      startsAt: currentEvent.starts_at,
      venue: currentEvent.venue,
      hostName: fullName ?? null,
    });
    if (result.ok) {
      toast({ title: "Invitation resent", description: g.invited_email });
    } else {
      toast({
        title: "Could not resend invitation",
        description: result.error ?? "Try the copy-link icon as a fallback.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveGuest = async (guestRowId: string) => {
    if (!window.confirm("Remove this guest?")) return;
    await (supabase as any).from("event_guests").delete().eq("id", guestRowId);
    await qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] });
  };

  const handleOverrideStatus = async (g: GuestRow, newStatus: "pending" | "accepted" | "declined") => {
    const { error } = await (supabase as any)
      .from("event_guests")
      .update({
        rsvp_status: newStatus,
        rsvp_responded_at: newStatus === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", g.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else await qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] });
  };

  const handleSaveEdit = async () => {
    if (!editingGuestId) return;
    const { error } = await (supabase as any)
      .from("event_guests")
      .update({
        full_name: editForm.full_name ?? null,
        invited_email: (editForm.invited_email ?? "").trim().toLowerCase(),
        phone_number: editForm.phone_number ?? null,
        plus_one_allowed: editForm.plus_one_allowed ?? false,
      })
      .eq("id", editingGuestId);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setEditingGuestId(null);
      setEditForm({});
      await qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] });
    }
  };

  const copyRsvpLink = (token: string) => {
    const url = `${window.location.origin}/rsvp/${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(url);
    toast({ title: "RSVP link copied", description: url });
  };

  // ---------- Drink ticket issuance ----------

  const issueTicketForGuest = async (g: GuestRow) => {
    if (!currentEventId) return;
    // Prefer event_guest_id so accountless guests work too. If the guest has
    // signed in we still link guest_id for backward compatibility.
    const row: Record<string, unknown> = {
      event_id: currentEventId,
      event_guest_id: g.id,
      status: "active",
    };
    if (g.guest_id) row.guest_id = g.guest_id;
    const { error } = await (supabase as any).from("drink_tickets").insert(row);
    if (error) {
      toast({ title: "Could not issue ticket", description: error.message, variant: "destructive" });
    } else {
      await qc.invalidateQueries({ queryKey: ["org-tickets", currentEventId] });
      toast({ title: "Ticket issued", description: g.invited_email });
    }
  };

  const voidTicket = async (ticketId: string) => {
    if (!window.confirm("Void this ticket? It can no longer be redeemed.")) return;
    const { error } = await (supabase as any)
      .from("drink_tickets")
      .update({ status: "void" })
      .eq("id", ticketId);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else await qc.invalidateQueries({ queryKey: ["org-tickets", currentEventId] });
  };

  const issueTicketsToAllAccepted = async () => {
    if (!currentEventId) return;
    const accepted = (guestsQuery.data ?? []).filter((g) => {
      if (g.rsvp_status !== "accepted") return false;
      const existing = ticketsForGuest(g).filter((t) => t.status !== "void");
      return existing.length === 0;
    });
    if (accepted.length === 0) {
      toast({ title: "Nothing to issue", description: "All accepted guests already have an active ticket." });
      return;
    }
    const rows = accepted.map((g) => {
      const r: Record<string, unknown> = {
        event_id: currentEventId,
        event_guest_id: g.id,
        status: "active",
      };
      if (g.guest_id) r.guest_id = g.guest_id;
      return r;
    });
    const { error } = await (supabase as any).from("drink_tickets").insert(rows);
    if (error) toast({ title: "Bulk issue failed", description: error.message, variant: "destructive" });
    else {
      await qc.invalidateQueries({ queryKey: ["org-tickets", currentEventId] });
      toast({ title: "Tickets issued", description: `${rows.length} new ticket(s)` });
    }
  };

  const copyTicketToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Ticket token copied", description: "Paste into the bartender's manual entry to test." });
  };

  const buildPassUrl = (token: string) =>
    `${window.location.origin}/pass/${encodeURIComponent(token)}`;

  const copyPassLink = (g: GuestRow) => {
    const url = buildPassUrl(g.rsvp_token);
    navigator.clipboard.writeText(url);
    toast({ title: "Pass link copied", description: url });
  };

  // Realtime subscriptions: keep guests + tickets fresh.
  useEffect(() => {
    if (!currentEventId) return;
    const guestsChannel = supabase
      .channel(`event-guests-${currentEventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_guests", filter: `event_id=eq.${currentEventId}` },
        () => qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] }),
      )
      .subscribe();
    const ticketsChannel = supabase
      .channel(`drink-tickets-${currentEventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "drink_tickets", filter: `event_id=eq.${currentEventId}` },
        () => qc.invalidateQueries({ queryKey: ["org-tickets", currentEventId] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(guestsChannel);
      void supabase.removeChannel(ticketsChannel);
    };
  }, [currentEventId, qc]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-sera-paper">
      <header className="border-b border-sera-line/70 bg-sera-cloud/80 backdrop-blur supports-[backdrop-filter]:bg-sera-cloud/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="sera-label text-sera-warm-grey">
              Sera Society · {role === "admin" || role === "host_admin" ? "Studio" : "Studio"}
            </p>
            <h1 className="font-serif text-xl text-sera-ink">{fullName ?? email ?? "Welcome"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "host_admin") && (
              <Button variant="sera-outline" size="sm" className="rounded-full" onClick={() => navigate("/admin")}>
                Admin review
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="sera-label text-sera-warm-grey">Your events</h2>
            <Button size="sm" variant="sera" className="rounded-full" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>

          {eventsQuery.isLoading && <p className="text-sm text-sera-warm-grey">Loading…</p>}
          {events.length === 0 && !eventsQuery.isLoading && (
            <div className="rounded-2xl border border-dashed border-sera-line bg-transparent p-6 text-center">
              <p className="font-serif text-base text-sera-ink">No events yet</p>
              <p className="mt-1 text-xs text-sera-warm-grey">Compose your first invitation to begin.</p>
            </div>
          )}
          <div className="space-y-2">
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setActiveEventId(ev.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  ev.id === currentEventId
                    ? "border-sera-ink bg-sera-ivory shadow-soft"
                    : "border-sera-line bg-sera-cloud hover:border-sera-ink/30"
                }`}
              >
                <p className="font-serif text-base text-sera-ink">{ev.title}</p>
                <p className="mt-1 text-xs text-sera-warm-grey">{fmt.format(new Date(ev.starts_at))}</p>
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                    ev.status === "published"
                      ? "bg-status-success-soft text-status-success"
                      : "bg-sera-line/50 text-sera-warm-grey"
                  }`}
                >
                  {ev.status}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main panel */}
        <section className="space-y-6">
          {!currentEvent ? (
            <div className="rounded-[28px] border border-dashed border-sera-line bg-sera-ivory p-12 text-center">
              <Calendar className="mx-auto mb-4 h-8 w-8 text-sera-warm-grey" strokeWidth={1.5} />
              <h3 className="font-serif text-3xl text-sera-ink">Begin with an event</h3>
              <p className="mt-2 text-sm text-sera-warm-grey">Select one from the left, or compose a new evening.</p>
            </div>
          ) : (
            <>
              <div className="rounded-[28px] border border-sera-line bg-sera-ivory p-6 shadow-soft md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="sera-label text-sera-warm-grey">{currentEvent.status}</p>
                    <h2 className="mt-1 font-serif text-4xl leading-[1.04] text-sera-ink">{currentEvent.title}</h2>
                    <p className="mt-3 text-sm text-sera-warm-grey">
                      {fmt.format(new Date(currentEvent.starts_at))}
                      {currentEvent.venue ? ` · ${currentEvent.venue}` : ""}
                      {currentEvent.capacity ? ` · cap ${currentEvent.capacity}` : ""}
                    </p>
                    {currentEvent.description && (
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sera-warm-grey">{currentEvent.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <Button variant="sera" size="sm" className="rounded-full" onClick={handlePublishToggle}>
                      {currentEvent.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDeleteEvent}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-5">
                  <Stat icon={<Users className="w-4 h-4" />} label="Guests" value={String(stats.totalGuests)} />
                  <Stat icon={<Check className="w-4 h-4" />} label="Accepted" value={String(stats.accepted)} />
                  <Stat icon={<X className="w-4 h-4" />} label="Declined" value={String(stats.declined)} />
                  <Stat icon={<Clock className="w-4 h-4" />} label="Pending" value={String(stats.pending)} />
                  <Stat icon={<Ticket className="w-4 h-4" />} label="Tickets" value={`${stats.ticketsRedeemed}/${stats.ticketsTotal}`} />
                </div>
              </div>

              {/* Guest management */}
              <div className="rounded-[28px] border border-sera-line bg-sera-ivory p-6 shadow-soft md:p-8">
                <div className="mb-5 flex items-baseline justify-between">
                  <div>
                    <p className="sera-label text-sera-warm-grey">The list</p>
                    <h3 className="mt-1 font-serif text-2xl text-sera-ink">Guests & RSVPs</h3>
                  </div>
                  <p className="text-xs text-sera-warm-grey">{stats.totalGuests} invited</p>
                </div>
                <div className="rounded-2xl border border-sera-line bg-sera-cloud p-4">
                  <p className="sera-label text-sera-warm-grey">Add a guest</p>
                  <form onSubmit={handleAddGuest} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      type="email"
                      placeholder="guest@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Full name (optional)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="rounded-xl"
                    />
                    <Input
                      placeholder="Phone (optional)"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="rounded-xl"
                    />
                    <label className="flex items-center gap-2 rounded-xl border border-sera-line bg-sera-ivory px-3 text-sm text-sera-ink">
                      <input
                        type="checkbox"
                        checked={guestPlusOne}
                        onChange={(e) => setGuestPlusOne(e.target.checked)}
                      />
                      Allow plus-ones
                    </label>
                    <Button type="submit" variant="sera" size="sm" disabled={addingGuest} className="rounded-full md:col-span-2">
                      {addingGuest ? "Adding…" : "Add guest"}
                    </Button>
                  </form>
                </div>

                <div className="mt-5 max-h-[32rem] space-y-2 overflow-auto pr-1">
                  {(guestsQuery.data ?? []).map((g) => {
                    const isEditing = editingGuestId === g.id;
                    return (
                      <div key={g.id} className="rounded-2xl border border-sera-line bg-sera-cloud px-4 py-3 text-sm transition-colors hover:border-sera-ink/20">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                placeholder="Full name"
                                value={editForm.full_name ?? ""}
                                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                              />
                              <Input
                                type="email"
                                placeholder="Email"
                                value={editForm.invited_email ?? ""}
                                onChange={(e) => setEditForm((f) => ({ ...f, invited_email: e.target.value }))}
                              />
                              <Input
                                placeholder="Phone"
                                value={editForm.phone_number ?? ""}
                                onChange={(e) => setEditForm((f) => ({ ...f, phone_number: e.target.value }))}
                              />
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={editForm.plus_one_allowed ?? false}
                                  onChange={(e) => setEditForm((f) => ({ ...f, plus_one_allowed: e.target.checked }))}
                                />
                                Plus-one allowed
                              </label>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingGuestId(null); setEditForm({}); }}>
                                Cancel
                              </Button>
                              <Button size="sm" variant="sera" onClick={handleSaveEdit}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{g.full_name ?? g.invited_email}</p>
                              {g.full_name && <p className="text-xs text-sera-warm-grey truncate">{g.invited_email}</p>}
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-sera-warm-grey">
                                {g.phone_number && <span>{g.phone_number}</span>}
                                {g.plus_one_allowed && (
                                  <span>+1 allowed{g.plus_one_count ? ` · ${g.plus_one_count} confirmed` : ""}</span>
                                )}
                                {g.rsvp_responded_at && (
                                  <span>· responded {new Date(g.rsvp_responded_at).toLocaleDateString()}</span>
                                )}
                              </div>
                              {g.rsvp_message && (
                                <p className="text-xs text-sera-stone mt-1 italic">"{g.rsvp_message}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <select
                                value={g.rsvp_status}
                                onChange={(e) => handleOverrideStatus(g, e.target.value as any)}
                                className="text-[11px] border border-sera-sand/60 px-2 py-1 bg-white uppercase tracking-wider"
                                aria-label="Override RSVP status"
                              >
                                <option value="pending">pending</option>
                                <option value="accepted">accepted</option>
                                <option value="declined">declined</option>
                              </select>
                              <button
                                onClick={() => copyRsvpLink(g.rsvp_token)}
                                className="p-1.5 text-sera-warm-grey hover:text-sera-navy"
                                aria-label="Copy RSVP link"
                                title="Copy RSVP link"
                              >
                                <Link2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => void resendInvitation(g)}
                                className="p-1.5 text-sera-warm-grey hover:text-sera-navy"
                                aria-label="Resend invitation email"
                                title="Resend invitation email"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGuestId(g.id);
                                  setEditForm({
                                    full_name: g.full_name,
                                    invited_email: g.invited_email,
                                    phone_number: g.phone_number,
                                    plus_one_allowed: g.plus_one_allowed,
                                  });
                                }}
                                className="p-1.5 text-sera-warm-grey hover:text-sera-navy"
                                aria-label="Edit guest"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveGuest(g.id)}
                                className="p-1.5 text-sera-warm-grey hover:text-sera-oxblood"
                                aria-label="Remove guest"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        {!isEditing && (() => {
                          const guestTickets = ticketsForGuest(g);
                          const activeTickets = guestTickets.filter((t) => t.status === "active");
                          const redeemedCount = guestTickets.filter((t) => t.status === "redeemed").length;
                          const accepted = g.rsvp_status === "accepted";
                          return (
                            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-sera-sand/30 pt-2 text-xs">
                              <span className="sera-label text-sera-stone">Drink ticket</span>
                              {guestTickets.length === 0 ? (
                                <Button
                                  size="sm"
                                  variant="sera-outline"
                                  onClick={() => issueTicketForGuest(g)}
                                  disabled={!accepted}
                                  title={accepted ? "Issue a drink ticket" : "Guest must accept first"}
                                >
                                  <Ticket className="w-3 h-3 mr-1" /> Issue
                                </Button>
                              ) : (
                                <>
                                  {activeTickets.length > 0 ? (
                                    <>
                                      <Badge variant="outline" className="text-[10px]">
                                        {activeTickets.length} active
                                      </Badge>
                                      {activeTickets[0] && (
                                        <>
                                          <button
                                            onClick={() => copyTicketToken(activeTickets[0].token)}
                                            className="text-sera-navy underline-offset-2 hover:underline"
                                            aria-label="Copy ticket token"
                                            title="Copy token to test in bartender manual entry"
                                          >
                                            copy token
                                          </button>
                                          <button
                                            onClick={() => voidTicket(activeTickets[0].id)}
                                            className="p-1 text-sera-warm-grey hover:text-sera-oxblood"
                                            aria-label="Void ticket"
                                            title="Void"
                                          >
                                            <Ban className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </>
                                  ) : null}
                                  <Button
                                    size="sm"
                                    variant="sera-outline"
                                    onClick={() => issueTicketForGuest(g)}
                                    disabled={!accepted}
                                  >
                                    <Ticket className="w-3 h-3 mr-1" /> Issue another
                                  </Button>
                                  {redeemedCount > 0 && (
                                    <span className="text-sera-warm-grey">· {redeemedCount} redeemed</span>
                                  )}
                                </>
                              )}
                              {accepted && (
                                <button
                                  onClick={() => copyPassLink(g)}
                                  className="ml-auto inline-flex items-center gap-1 text-sera-navy underline-offset-2 hover:underline"
                                  aria-label="Copy guest pass link"
                                  title="Copy guest pass link"
                                >
                                  <Wallet className="w-3.5 h-3.5" /> Copy pass link
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                  {(guestsQuery.data ?? []).length === 0 && (
                    <p className="text-sm text-sera-warm-grey">No guests yet.</p>
                  )}
                </div>
              </div>

              {/* Operations entry points */}
              <div className="grid md:grid-cols-3 gap-4">
                <EntryCard
                  icon={<Ticket className="w-5 h-5" />}
                  title="Issue drink tickets"
                  description={`${stats.ticketsRedeemed}/${stats.ticketsTotal} redeemed · click to bulk-issue to all accepted guests`}
                  onClick={() => void issueTicketsToAllAccepted()}
                />
                <EntryCard
                  icon={<ScanLine className="w-5 h-5" />}
                  title="Check-in"
                  description="Open the door scanner"
                  onClick={() => navigate(`/check-in?event=${currentEvent.id}`)}
                />
                <EntryCard
                  icon={<Users className="w-5 h-5" />}
                  title="Bartender panel"
                  description="Live redemption feed"
                  onClick={() => navigate("/ops/bartender")}
                />
              </div>
            </>
          )}
        </section>
      </main>

      <CreateEventFlow
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleEventCreated}
      />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sera-line bg-sera-cloud px-4 py-3">
      <div className="flex items-center gap-1.5 text-sera-warm-grey">
        {icon}
        <p className="text-[10px] uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-1 font-serif text-2xl text-sera-ink tabular-nums">{value}</p>
    </div>
  );
}

function EntryCard({ icon, title, description, onClick }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[24px] border border-sera-line bg-sera-ivory p-5 text-left transition-all hover:-translate-y-px hover:border-sera-ink/30 hover:shadow-soft"
    >
      <div className="flex items-center gap-2 text-sera-ink">
        {icon}
        <span className="font-serif text-lg">{title}</span>
      </div>
      <p className="mt-2 text-sm text-sera-warm-grey">{description}</p>
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-sera-warm-grey">{label}</Label>
      {children}
    </div>
  );
}
