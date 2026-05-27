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
    <div style={{ minHeight: "100vh", background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "var(--font-sans)" }}>
      <header style={{ borderBottom: "1px solid var(--app-card-border)", background: "rgba(7,20,38,0.82)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--app-line-brass)", margin: 0 }}>
              Sera Society · {role === "admin" || role === "host_admin" ? "Studio" : "Studio"}
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 500, color: "var(--app-text)", margin: "2px 0 0", letterSpacing: "-0.01em" }}>{fullName ?? email ?? "Welcome"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "host_admin") && (
              <button onClick={() => navigate("/admin")} style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--app-text-muted)", background: "transparent", border: "1px solid var(--app-card-border)", borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}>
                Admin review
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} style={{ color: "var(--app-text-muted)" }}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--app-line-brass)" }}>Your events</span>
            <button onClick={() => setShowCreate(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#5A1218", color: "#F4EBDD", border: 0, borderRadius: 999, padding: "6px 12px", fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
              <Plus className="w-3 h-3" /> New
            </button>
          </div>

          {eventsQuery.isLoading && <p style={{ fontSize: "0.875rem", color: "var(--app-text-muted)" }}>Loading…</p>}
          {events.length === 0 && !eventsQuery.isLoading && (
            <div style={{ border: "1px dashed var(--app-card-border)", padding: "24px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--app-text)", margin: 0 }}>No events yet</p>
              <p style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--app-text-muted)" }}>Compose your first invitation to begin.</p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setActiveEventId(ev.id)}
                style={{
                  width: "100%", textAlign: "left", padding: "14px 16px", cursor: "pointer",
                  border: ev.id === currentEventId ? "1px solid #A9845C" : "1px solid var(--app-card-border)",
                  background: ev.id === currentEventId ? "rgba(169,132,92,0.08)" : "transparent",
                  color: "var(--app-text)", transition: "all 160ms",
                }}
              >
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--app-text)", margin: 0, letterSpacing: "-0.01em" }}>{ev.title}</p>
                <p style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--app-text-muted)" }}>{fmt.format(new Date(ev.starts_at))}</p>
                <span style={{
                  display: "inline-flex", alignItems: "center", marginTop: 6,
                  fontFamily: "var(--font-sans)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: ev.status === "published" ? "#3D4A35" : "#A9845C",
                }}>
                  {ev.status}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main panel */}
        <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {!currentEvent ? (
            <div style={{ border: "1px dashed var(--app-card-border)", padding: "48px", textAlign: "center" }}>
              <Calendar className="mx-auto mb-4 h-8 w-8" style={{ color: "var(--app-text-muted)" }} strokeWidth={1.5} />
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 500, color: "var(--app-text)", letterSpacing: "-0.03em", margin: 0 }}>Begin with an event</h3>
              <p style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--app-text-muted)" }}>Select one from the left, or compose a new evening.</p>
            </div>
          ) : (
            <>
              <div style={{ border: "1px solid var(--app-card-border)", background: "var(--app-card-bg)", padding: "28px 32px" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--app-line-brass)" }}>{currentEvent.status}</span>
                      {currentEvent.status === "published" && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#3D4A35", border: "1px solid rgba(61,74,53,0.5)", padding: "2px 7px", borderRadius: 999, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                          <span style={{ width: 5, height: 5, borderRadius: 999, background: "#3D4A35" }} />
                          Live
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.8rem,3vw,2.8rem)", lineHeight: 0.98, letterSpacing: "-0.04em", color: "var(--app-text)", margin: 0 }}>{currentEvent.title}</h2>
                    <p style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--app-text-muted)" }}>
                      {fmt.format(new Date(currentEvent.starts_at))}
                      {currentEvent.venue ? ` · ${currentEvent.venue}` : ""}
                      {currentEvent.capacity ? ` · cap ${currentEvent.capacity}` : ""}
                    </p>
                    {currentEvent.description && (
                      <p style={{ marginTop: 12, maxWidth: 600, fontSize: "0.94rem", lineHeight: 1.6, color: "var(--app-text-muted)" }}>{currentEvent.description}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexShrink: 0, flexDirection: "column", gap: 8 }}>
                    <button onClick={handlePublishToggle} style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", background: "#5A1218", color: "#F4EBDD", border: 0, borderRadius: 999, padding: "8px 16px", cursor: "pointer" }}>
                      {currentEvent.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={handleDeleteEvent} style={{ background: "transparent", border: "1px solid var(--app-card-border)", color: "var(--app-text-muted)", borderRadius: 999, padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }} className="grid-cols-2 md:!grid-cols-5">
                  <Stat icon={<Users className="w-4 h-4" />} label="Guests" value={String(stats.totalGuests)} />
                  <Stat icon={<Check className="w-4 h-4" />} label="Accepted" value={String(stats.accepted)} />
                  <Stat icon={<X className="w-4 h-4" />} label="Declined" value={String(stats.declined)} />
                  <Stat icon={<Clock className="w-4 h-4" />} label="Pending" value={String(stats.pending)} />
                  <Stat icon={<Ticket className="w-4 h-4" />} label="Tickets" value={`${stats.ticketsRedeemed}/${stats.ticketsTotal}`} />
                </div>
              </div>

              {/* Guest management */}
              <div style={{ border: "1px solid var(--app-card-border)", background: "var(--app-card-bg)", padding: "24px 32px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--app-line-brass)" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--app-line-brass)", margin: 0 }}>The list</p>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.5rem", letterSpacing: "-0.02em", color: "var(--app-text)", margin: "6px 0 0" }}>Guests &amp; RSVPs</h3>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--app-text-muted)" }}>{stats.totalGuests} invited · {stats.accepted} accepted</span>
                </div>
                <div style={{ border: "1px solid var(--app-card-border)", background: "rgba(7,20,38,0.5)", padding: "18px 20px", marginBottom: 16 }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--app-line-brass)", margin: "0 0 14px" }}>Compose · add a guest</p>
                  <form onSubmit={handleAddGuest} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      type="email"
                      placeholder="guest@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--app-card-border)", color: "var(--app-text)", borderRadius: 0 }}
                    />
                    <Input
                      placeholder="Full name (optional)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--app-card-border)", color: "var(--app-text)", borderRadius: 0 }}
                    />
                    <Input
                      placeholder="Phone (optional)"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--app-card-border)", color: "var(--app-text)", borderRadius: 0 }}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--app-card-border)", fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--app-text)" }}>
                      <input
                        type="checkbox"
                        checked={guestPlusOne}
                        onChange={(e) => setGuestPlusOne(e.target.checked)}
                      />
                      Allow plus-ones
                    </label>
                    <button type="submit" disabled={addingGuest} className="md:col-span-2" style={{ background: "#5A1218", color: "#F4EBDD", border: 0, borderRadius: 999, padding: "10px 20px", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", cursor: addingGuest ? "not-allowed" : "pointer", opacity: addingGuest ? 0.7 : 1 }}>
                      {addingGuest ? "Adding…" : "Place on the list"}
                    </button>
                  </form>
                </div>

                <div className="mt-2 max-h-[32rem] overflow-auto pr-1" style={{ display: "flex", flexDirection: "column" }}>
                  {(guestsQuery.data ?? []).map((g) => {
                    const isEditing = editingGuestId === g.id;
                    return (
                      <div key={g.id} style={{ borderTop: "1px solid var(--app-card-border)", padding: "14px 0", fontSize: "0.875rem", transition: "background 160ms" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input placeholder="Full name" value={editForm.full_name ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--app-card-border)", color: "var(--app-text)", borderRadius: 0 }} />
                              <Input type="email" placeholder="Email" value={editForm.invited_email ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, invited_email: e.target.value }))} style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--app-card-border)", color: "var(--app-text)", borderRadius: 0 }} />
                              <Input placeholder="Phone" value={editForm.phone_number ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, phone_number: e.target.value }))} style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--app-card-border)", color: "var(--app-text)", borderRadius: 0 }} />
                              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--app-text)" }}>
                                <input type="checkbox" checked={editForm.plus_one_allowed ?? false} onChange={(e) => setEditForm((f) => ({ ...f, plus_one_allowed: e.target.checked }))} />
                                Plus-one allowed
                              </label>
                            </div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button onClick={() => { setEditingGuestId(null); setEditForm({}); }} style={{ background: "transparent", border: "1px solid var(--app-card-border)", color: "var(--app-text-muted)", borderRadius: 999, padding: "6px 14px", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
                              <button onClick={handleSaveEdit} style={{ background: "#5A1218", color: "#F4EBDD", border: 0, borderRadius: 999, padding: "6px 14px", fontSize: "0.75rem", cursor: "pointer" }}>Save</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--app-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.full_name ?? g.invited_email}</p>
                              {g.full_name && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--app-text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.invited_email}</p>}
                              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--app-text-muted)" }}>
                                {g.phone_number && <span>{g.phone_number}</span>}
                                {g.plus_one_allowed && <span>+1 allowed{g.plus_one_count ? ` · ${g.plus_one_count} confirmed` : ""}</span>}
                                {g.rsvp_responded_at && <span>· responded {new Date(g.rsvp_responded_at).toLocaleDateString()}</span>}
                              </div>
                              {g.rsvp_message && <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.78rem", color: "var(--app-text-muted)", marginTop: 6 }}>"{g.rsvp_message}"</p>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                              <select value={g.rsvp_status} onChange={(e) => handleOverrideStatus(g, e.target.value as any)} aria-label="Override RSVP status" style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", border: "1px solid var(--app-card-border)", background: "rgba(7,20,38,0.7)", color: "var(--app-text)", padding: "4px 8px" }}>
                                <option value="pending">pending</option>
                                <option value="accepted">accepted</option>
                                <option value="declined">declined</option>
                              </select>
                              <button onClick={() => copyRsvpLink(g.rsvp_token)} style={{ background: "transparent", border: "1px solid var(--app-card-border)", width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--app-text-muted)", cursor: "pointer" }} aria-label="Copy RSVP link" title="Copy RSVP link"><Link2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => void resendInvitation(g)} style={{ background: "transparent", border: "1px solid var(--app-card-border)", width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--app-text-muted)", cursor: "pointer" }} aria-label="Resend invitation" title="Resend invitation"><Send className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { setEditingGuestId(g.id); setEditForm({ full_name: g.full_name, invited_email: g.invited_email, phone_number: g.phone_number, plus_one_allowed: g.plus_one_allowed }); }} style={{ background: "transparent", border: "1px solid var(--app-card-border)", width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--app-text-muted)", cursor: "pointer" }} aria-label="Edit guest" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleRemoveGuest(g.id)} style={{ background: "transparent", border: "1px solid var(--app-card-border)", width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--app-text-muted)", cursor: "pointer" }} aria-label="Remove guest" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        )}
                        {!isEditing && (() => {
                          const guestTickets = ticketsForGuest(g);
                          const activeTickets = guestTickets.filter((t) => t.status === "active");
                          const redeemedCount = guestTickets.filter((t) => t.status === "redeemed").length;
                          const accepted = g.rsvp_status === "accepted";
                          return (
                            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, borderTop: "1px solid var(--app-card-border)", paddingTop: 8 }}>
                              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--app-line-brass)" }}>Drink ticket</span>
                              {guestTickets.length === 0 ? (
                                <button onClick={() => issueTicketForGuest(g)} disabled={!accepted} title={accepted ? "Issue a drink ticket" : "Guest must accept first"} style={{ background: "transparent", border: "1px solid var(--app-card-border)", color: "var(--app-text-muted)", borderRadius: 999, padding: "3px 10px", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: accepted ? "pointer" : "not-allowed", opacity: accepted ? 1 : 0.4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <Ticket className="w-3 h-3" /> Issue
                                </button>
                              ) : (
                                <>
                                  {activeTickets.length > 0 ? (
                                    <>
                                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#3D4A35", border: "1px solid rgba(61,74,53,0.5)", padding: "2px 7px", borderRadius: 999 }}>{activeTickets.length} active</span>
                                      {activeTickets[0] && (
                                        <>
                                          <button onClick={() => copyTicketToken(activeTickets[0].token)} style={{ background: "none", border: "none", color: "var(--app-text-muted)", fontSize: "0.72rem", textDecoration: "underline", cursor: "pointer" }} title="Copy token">copy token</button>
                                          <button onClick={() => voidTicket(activeTickets[0].id)} style={{ background: "transparent", border: "1px solid var(--app-card-border)", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--app-text-muted)", cursor: "pointer" }} title="Void"><Ban className="w-3 h-3" /></button>
                                        </>
                                      )}
                                    </>
                                  ) : null}
                                  <button onClick={() => issueTicketForGuest(g)} disabled={!accepted} style={{ background: "transparent", border: "1px solid var(--app-card-border)", color: "var(--app-text-muted)", borderRadius: 999, padding: "3px 10px", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: accepted ? "pointer" : "not-allowed", opacity: accepted ? 1 : 0.4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    <Ticket className="w-3 h-3" /> Issue another
                                  </button>
                                  {redeemedCount > 0 && <span style={{ color: "var(--app-text-muted)", fontSize: "0.72rem" }}>· {redeemedCount} redeemed</span>}
                                </>
                              )}
                              {accepted && (
                                <button onClick={() => copyPassLink(g)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--app-text-muted)", fontSize: "0.72rem", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", textDecoration: "underline" }} title="Copy guest pass link">
                                  <Wallet className="w-3.5 h-3.5" /> Hold in wallet
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                  {(guestsQuery.data ?? []).length === 0 && (
                    <p style={{ fontSize: "0.875rem", color: "var(--app-text-muted)", padding: "20px 0" }}>No guests yet.</p>
                  )}
                </div>
              </div>

              {/* Operations entry points */}
              <div className="grid md:grid-cols-3 gap-4">
                <EntryCard
                  icon={<Ticket className="w-5 h-5" />}
                  title="Hand out passes"
                  description={`${stats.ticketsRedeemed}/${stats.ticketsTotal} redeemed · bulk-issue to all accepted guests`}
                  onClick={() => void issueTicketsToAllAccepted()}
                />
                <EntryCard
                  icon={<ScanLine className="w-5 h-5" />}
                  title="Open the door"
                  description="Start check-in for arrivals"
                  onClick={() => navigate(`/check-in?event=${currentEvent.id}`)}
                />
                <EntryCard
                  icon={<Users className="w-5 h-5" />}
                  title="The bar"
                  description="Live drink ticket redemption"
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
    <div style={{ border: "1px solid var(--app-card-border)", background: "rgba(13,27,46,0.5)", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--app-text-muted)" }}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.8rem", letterSpacing: "-0.02em", color: "var(--app-text)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

function EntryCard({ icon, title, description, onClick }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ border: "1px solid var(--app-line-brass)", background: "rgba(169,132,92,0.04)", padding: "22px 22px", textAlign: "left", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", color: "var(--app-text)", width: "100%", transition: "border-color 160ms, background 160ms" }}
    >
      <span style={{ width: 36, height: 36, border: "1px solid var(--app-line-brass)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#A9845C", flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--app-text)", margin: 0, letterSpacing: "-0.01em" }}>{title}</p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--app-text-muted)", margin: "2px 0 0" }}>{description}</p>
      </div>
    </button>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--app-text-muted)" }}>{label}</Label>
      {children}
    </div>
  );
}
