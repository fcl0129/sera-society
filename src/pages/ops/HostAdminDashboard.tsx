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
import { LogOut, Plus, Calendar, Users, Ticket, ScanLine, Trash2, Mail, Link2, Pencil, Check, X, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

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
};

export default function HostAdminDashboard() {
  const { fullName, email, role } = useAuthState();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create event form state
  const [newTitle, setNewTitle] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Guest form state
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [addingGuest, setAddingGuest] = useState(false);

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
        .select("id,status,guest_id,redeemed_at")
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

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCreateError("Session expired. Please sign in again.");
      setCreating(false);
      return;
    }

    if (!newTitle.trim() || !newStartsAt) {
      setCreateError("Title and start time are required.");
      setCreating(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("events")
      .insert({
        organizer_id: user.id,
        title: newTitle.trim(),
        venue: newVenue.trim() || null,
        starts_at: new Date(newStartsAt).toISOString(),
        capacity: newCapacity ? Number(newCapacity) : null,
        description: newDescription.trim() || null,
        status: "draft",
      })
      .select("id")
      .single();

    if (error) {
      setCreateError(error.message);
      setCreating(false);
      return;
    }

    setNewTitle(""); setNewVenue(""); setNewStartsAt(""); setNewCapacity(""); setNewDescription("");
    setShowCreate(false);
    setActiveEventId(data?.id ?? null);
    setCreating(false);
    await qc.invalidateQueries({ queryKey: ["org-events"] });
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
    const { error } = await (supabase as any)
      .from("event_guests")
      .insert({
        event_id: currentEventId,
        invited_email: guestEmail.trim().toLowerCase(),
        full_name: guestName.trim() || null,
      });
    if (!error) {
      setGuestEmail(""); setGuestName("");
      await qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] });
    } else {
      window.alert(`Could not add guest: ${error.message}`);
    }
    setAddingGuest(false);
  };

  const handleRemoveGuest = async (guestRowId: string) => {
    await (supabase as any).from("event_guests").delete().eq("id", guestRowId);
    await qc.invalidateQueries({ queryKey: ["org-guests", currentEventId] });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen sera-surface-light">
      <header className="border-b border-sera-sand/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="sera-label text-sera-stone">{role === "admin" || role === "host_admin" ? "Admin" : "Organizer"}</p>
            <h1 className="font-serif text-xl text-sera-navy">{fullName ?? email ?? "Sera"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(role === "admin" || role === "host_admin") && (
              <Button variant="sera-outline" size="sm" onClick={() => navigate("/admin")}>
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
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="sera-label text-sera-stone">Events</h2>
            <Button size="sm" variant="sera" onClick={() => setShowCreate((v) => !v)}>
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>

          {showCreate && (
            <Card className="p-4 space-y-3 bg-white">
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">Title *</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">Starts at *</Label>
                  <Input type="datetime-local" value={newStartsAt} onChange={(e) => setNewStartsAt(e.target.value)} required />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">Venue</Label>
                  <Input value={newVenue} onChange={(e) => setNewVenue(e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">Capacity</Label>
                  <Input type="number" value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider">Description</Label>
                  <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} />
                </div>
                {createError && <p className="text-xs text-sera-oxblood">{createError}</p>}
                <Button type="submit" variant="sera" size="sm" disabled={creating} className="w-full">
                  {creating ? "Creating…" : "Create event"}
                </Button>
              </form>
            </Card>
          )}

          {eventsQuery.isLoading && <p className="text-sm text-sera-warm-grey">Loading…</p>}
          {events.length === 0 && !eventsQuery.isLoading && (
            <p className="text-sm text-sera-warm-grey">No events yet. Create your first event.</p>
          )}
          <div className="space-y-2">
            {events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setActiveEventId(ev.id)}
                className={`w-full text-left p-3 border transition-colors ${
                  ev.id === currentEventId
                    ? "border-sera-navy bg-sera-navy/5"
                    : "border-sera-sand/60 bg-white hover:border-sera-navy/40"
                }`}
              >
                <p className="font-serif text-sera-navy">{ev.title}</p>
                <p className="text-xs text-sera-warm-grey mt-1">{fmt.format(new Date(ev.starts_at))}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">{ev.status}</Badge>
              </button>
            ))}
          </div>
        </aside>

        {/* Main panel */}
        <section className="space-y-6">
          {!currentEvent ? (
            <Card className="p-10 text-center bg-white">
              <Calendar className="w-10 h-10 mx-auto text-sera-warm-grey mb-3" />
              <h3 className="font-serif text-2xl text-sera-navy">Select or create an event</h3>
              <p className="text-sm text-sera-warm-grey mt-2">Your events will appear in the sidebar.</p>
            </Card>
          ) : (
            <>
              <Card className="p-6 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="sera-label text-sera-stone">{currentEvent.status}</p>
                    <h2 className="font-serif text-3xl text-sera-navy mt-1">{currentEvent.title}</h2>
                    <p className="text-sm text-sera-warm-grey mt-2">
                      {fmt.format(new Date(currentEvent.starts_at))}
                      {currentEvent.venue ? ` · ${currentEvent.venue}` : ""}
                      {currentEvent.capacity ? ` · cap ${currentEvent.capacity}` : ""}
                    </p>
                    {currentEvent.description && (
                      <p className="text-sm text-sera-warm-grey mt-3">{currentEvent.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="sera" size="sm" onClick={handlePublishToggle}>
                      {currentEvent.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDeleteEvent}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <Stat icon={<Users className="w-4 h-4" />} label="Guests" value={String(stats.totalGuests)} />
                  <Stat icon={<Mail className="w-4 h-4" />} label="RSVP yes" value={String(stats.yesRsvp)} />
                  <Stat icon={<Ticket className="w-4 h-4" />} label="Tickets" value={`${stats.ticketsRedeemed}/${stats.ticketsTotal}`} />
                  <Stat icon={<ScanLine className="w-4 h-4" />} label="Pending RSVP" value={String(stats.pending)} />
                </div>
              </Card>

              {/* Guest management */}
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl text-sera-navy">Guests & RSVPs</h3>
                </div>
                <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mb-4">
                  <Input
                    type="email"
                    placeholder="guest@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <Button type="submit" variant="sera" size="sm" disabled={addingGuest}>
                    {addingGuest ? "Adding…" : "Add guest"}
                  </Button>
                </form>

                <div className="space-y-1 max-h-80 overflow-auto">
                  {(guestsQuery.data ?? []).map((g) => (
                    <div key={g.id} className="flex items-center justify-between border border-sera-sand/40 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{g.full_name ?? g.invited_email}</p>
                        {g.full_name && <p className="text-xs text-sera-warm-grey">{g.invited_email}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">{g.rsvp_status}</Badge>
                        <button
                          onClick={() => handleRemoveGuest(g.id)}
                          className="text-sera-warm-grey hover:text-sera-oxblood"
                          aria-label="Remove guest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(guestsQuery.data ?? []).length === 0 && (
                    <p className="text-sm text-sera-warm-grey">No guests yet.</p>
                  )}
                </div>
              </Card>

              {/* Operations entry points */}
              <div className="grid md:grid-cols-3 gap-4">
                <EntryCard
                  icon={<Ticket className="w-5 h-5" />}
                  title="Drink tickets"
                  description={`${stats.ticketsRedeemed} of ${stats.ticketsTotal} redeemed`}
                  onClick={() => navigate(`/manage-events?event=${currentEvent.id}`)}
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
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-sera-sand/40 p-3">
      <div className="flex items-center gap-2 text-sera-warm-grey">
        {icon}
        <p className="text-[10px] uppercase tracking-wider">{label}</p>
      </div>
      <p className="font-serif text-2xl text-sera-navy mt-1">{value}</p>
    </div>
  );
}

function EntryCard({ icon, title, description, onClick }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-5 border border-sera-sand/60 bg-white hover:border-sera-navy/40 transition-colors"
    >
      <div className="flex items-center gap-2 text-sera-navy mb-2">{icon}<span className="font-serif text-lg">{title}</span></div>
      <p className="text-sm text-sera-warm-grey">{description}</p>
    </button>
  );
}
