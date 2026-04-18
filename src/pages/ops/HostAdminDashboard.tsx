import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Users, Ticket, LogOut } from "lucide-react";

type EventRow = {
  id: string;
  title: string;
  venue: string | null;
  description: string | null;
  starts_at: string;
  status: string;
  organizer_id: string;
};

type GuestRow = {
  id: string;
  invited_email: string;
  guest_id: string;
  tier: string | null;
  profiles: { full_name: string | null; email: string } | null;
};

type TicketRow = {
  id: string;
  guest_id: string;
  status: string;
  redeemed_at: string | null;
};

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function HostAdminDashboard() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);

  const eventsQuery = useQuery({
    queryKey: ["organizer-events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id, title, venue, description, starts_at, status, organizer_id")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });

  const events = eventsQuery.data ?? [];
  const activeEvent = events.find((e) => e.id === selectedEventId) ?? events[0] ?? null;
  const activeId = activeEvent?.id ?? null;

  const guestsQuery = useQuery({
    queryKey: ["event-guests", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_guests")
        .select("id, invited_email, guest_id, tier, profiles!event_guests_guest_id_fkey(full_name,email)")
        .eq("event_id", activeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GuestRow[];
    },
  });

  const ticketsQuery = useQuery({
    queryKey: ["event-tickets", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("drink_tickets")
        .select("id, guest_id, status, redeemed_at")
        .eq("event_id", activeId);
      if (error) throw error;
      return (data ?? []) as TicketRow[];
    },
  });

  const tickets = ticketsQuery.data ?? [];
  const guests = guestsQuery.data ?? [];

  const stats = useMemo(() => {
    return {
      events: events.length,
      guests: guests.length,
      active: tickets.filter((t) => t.status === "active").length,
      redeemed: tickets.filter((t) => t.status === "redeemed").length,
    };
  }, [events, guests, tickets]);

  const ticketsByGuest = useMemo(() => {
    const m = new Map<string, { active: number; redeemed: number }>();
    for (const t of tickets) {
      const cur = m.get(t.guest_id) ?? { active: 0, redeemed: 0 };
      if (t.status === "active") cur.active += 1;
      else if (t.status === "redeemed") cur.redeemed += 1;
      m.set(t.guest_id, cur);
    }
    return m;
  }, [tickets]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <header className="border-b border-sera-sand/40 bg-sera-ivory/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="sera-label text-sera-stone">Host admin</p>
            <h1 className="font-serif text-xl text-sera-navy">{fullName ?? email ?? "Sera Society"}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-warm-grey">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Events", value: stats.events },
            { label: "Guests", value: stats.guests },
            { label: "Active tickets", value: stats.active },
            { label: "Redeemed", value: stats.redeemed },
          ].map((card) => (
            <article key={card.label} className="border border-sera-sand/40 bg-sera-ivory p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-sera-stone">{card.label}</p>
              <p className="font-serif text-2xl text-sera-navy mt-2">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1fr_2fr] gap-6">
          <aside className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-sera-navy">Events</h2>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="sera">
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-sera-ivory">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-sera-navy">Create event</DialogTitle>
                  </DialogHeader>
                  <CreateEventForm
                    onCreated={(id) => {
                      setCreateOpen(false);
                      setSelectedEventId(id);
                      void qc.invalidateQueries({ queryKey: ["organizer-events"] });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {eventsQuery.isLoading && <p className="text-sm text-sera-warm-grey">Loading…</p>}
            {!eventsQuery.isLoading && events.length === 0 && (
              <p className="text-sm text-sera-warm-grey border border-dashed border-sera-sand/60 p-4">
                No events yet. Create one to begin.
              </p>
            )}

            <div className="space-y-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full text-left border p-3 transition-colors ${
                    activeId === event.id
                      ? "border-sera-navy bg-sera-ivory"
                      : "border-sera-sand/40 bg-sera-ivory/60 hover:border-sera-navy/40"
                  }`}
                >
                  <p className="font-serif text-sera-navy">{event.title}</p>
                  <p className="text-xs text-sera-warm-grey mt-1">
                    {fmt.format(new Date(event.starts_at))}
                    {event.venue ? ` · ${event.venue}` : ""}
                  </p>
                  <Badge variant="outline" className="mt-2 text-[10px] capitalize border-sera-sand/60">
                    {event.status}
                  </Badge>
                </button>
              ))}
            </div>
          </aside>

          <article className="space-y-6">
            {activeEvent ? (
              <>
                <div className="border border-sera-sand/40 bg-sera-ivory p-5 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="sera-label text-sera-stone">Event</p>
                      <h2 className="font-serif text-2xl text-sera-navy">{activeEvent.title}</h2>
                      <p className="text-sm text-sera-warm-grey mt-1">
                        {fmt.format(new Date(activeEvent.starts_at))}
                        {activeEvent.venue ? ` · ${activeEvent.venue}` : ""}
                      </p>
                    </div>
                    <PublishToggle event={activeEvent} onChanged={() => qc.invalidateQueries({ queryKey: ["organizer-events"] })} />
                  </div>
                  {activeEvent.description && (
                    <p className="mt-4 text-sm text-sera-warm-grey leading-relaxed">{activeEvent.description}</p>
                  )}
                </div>

                <div className="border border-sera-sand/40 bg-sera-ivory p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sera-oxblood" />
                      <h3 className="font-serif text-xl text-sera-navy">Guests ({guests.length})</h3>
                    </div>
                    <Dialog open={addGuestOpen} onOpenChange={setAddGuestOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="sera-outline">
                          <Plus className="w-4 h-4 mr-1" />
                          Add guest
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-sera-ivory">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl text-sera-navy">Invite a guest</DialogTitle>
                        </DialogHeader>
                        <AddGuestForm
                          eventId={activeEvent.id}
                          onAdded={() => {
                            setAddGuestOpen(false);
                            void qc.invalidateQueries({ queryKey: ["event-guests", activeEvent.id] });
                            void qc.invalidateQueries({ queryKey: ["event-tickets", activeEvent.id] });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {guests.length === 0 ? (
                    <p className="text-sm text-sera-warm-grey">No guests yet.</p>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-sera-stone border-b border-sera-sand/40">
                            <th className="py-2">Guest</th>
                            <th className="py-2">Tickets</th>
                            <th className="py-2 text-right">Issue more</th>
                          </tr>
                        </thead>
                        <tbody>
                          {guests.map((g) => {
                            const counts = ticketsByGuest.get(g.guest_id) ?? { active: 0, redeemed: 0 };
                            return (
                              <tr key={g.id} className="border-b border-sera-sand/20">
                                <td className="py-3">
                                  <p className="text-sera-navy">{g.profiles?.full_name ?? g.invited_email}</p>
                                  <p className="text-xs text-sera-warm-grey">{g.invited_email}</p>
                                </td>
                                <td className="py-3 text-sera-warm-grey">
                                  <span className="text-sera-navy font-medium">{counts.active}</span> active
                                  <span className="mx-1">·</span>
                                  {counts.redeemed} redeemed
                                </td>
                                <td className="py-3 text-right">
                                  <IssueTicketsButton
                                    eventId={activeEvent.id}
                                    guestId={g.guest_id}
                                    onDone={() =>
                                      qc.invalidateQueries({ queryKey: ["event-tickets", activeEvent.id] })
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <RecentRedemptions eventId={activeEvent.id} />
              </>
            ) : (
              <div className="border border-dashed border-sera-sand/60 p-12 text-center">
                <p className="font-serif text-2xl text-sera-navy mb-2">Begin your first evening</p>
                <p className="text-sm text-sera-warm-grey">Create an event to start curating guests.</p>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

function CreateEventForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setBusy(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from("events")
      .insert({
        organizer_id: u.user.id,
        title,
        venue: venue || null,
        description: description || null,
        starts_at: new Date(startsAt).toISOString(),
        status: "draft",
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Event created");
    onCreated(data.id);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="sera-label text-sera-navy text-[10px]">Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="sera-label text-sera-navy text-[10px]">Date & time</Label>
          <Input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label className="sera-label text-sera-navy text-[10px]">Venue</Label>
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="sera-label text-sera-navy text-[10px]">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
      </div>
      <Button variant="sera" type="submit" disabled={busy} className="w-full">
        {busy ? "Creating…" : "Create event"}
      </Button>
    </form>
  );
}

function AddGuestForm({ eventId, onAdded }: { eventId: string; onAdded: () => void }) {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState(2);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const normalized = email.trim().toLowerCase();

      // Find or create a profile for this email. We can't insert into auth.users from the client,
      // so we look up an existing profile; if absent, we still create the guest invite row.
      const { data: existing } = await (supabase as any)
        .from("profiles")
        .select("id, email")
        .ilike("email", normalized)
        .maybeSingle();

      if (!existing) {
        toast.error(
          "This email isn't on Sera yet. Ask them to sign in once with the magic link, then add them again."
        );
        setBusy(false);
        return;
      }

      const { error: inviteError } = await (supabase as any).from("event_guests").insert({
        event_id: eventId,
        guest_id: existing.id,
        invited_email: normalized,
      });
      if (inviteError) {
        if (inviteError.code === "23505") {
          toast.error("Guest already invited.");
        } else {
          throw inviteError;
        }
        setBusy(false);
        return;
      }

      // Issue initial tickets
      if (tickets > 0) {
        const rows = Array.from({ length: tickets }, () => ({
          event_id: eventId,
          guest_id: existing.id,
        }));
        const { error: tErr } = await (supabase as any).from("drink_tickets").insert(rows);
        if (tErr) throw tErr;
      }

      // Notify guest by email (best-effort)
      const { data: ev } = await (supabase as any)
        .from("events")
        .select("title, starts_at, venue")
        .eq("id", eventId)
        .maybeSingle();

      void supabase.functions.invoke("send-sera-email", {
        body: {
          template: "invitation",
          to: normalized,
          data: {
            event_title: ev?.title,
            event_date: ev ? new Date(ev.starts_at).toLocaleString() : "",
            venue: ev?.venue,
            app_url: window.location.origin,
          },
        },
      });

      toast.success("Guest invited");
      onAdded();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label className="sera-label text-sera-navy text-[10px]">Guest email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="guest@example.com"
          className="mt-1"
        />
        <p className="text-[11px] text-sera-warm-grey mt-1">
          The guest must have signed into Sera once before they can be added.
        </p>
      </div>
      <div>
        <Label className="sera-label text-sera-navy text-[10px]">Drink tickets to issue</Label>
        <Input
          type="number"
          min={0}
          max={20}
          value={tickets}
          onChange={(e) => setTickets(Number(e.target.value))}
          className="mt-1"
        />
      </div>
      <Button variant="sera" type="submit" disabled={busy} className="w-full">
        {busy ? "Sending…" : "Invite guest"}
      </Button>
    </form>
  );
}

function IssueTicketsButton({
  eventId,
  guestId,
  onDone,
}: {
  eventId: string;
  guestId: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const issue = async () => {
    setBusy(true);
    const { error } = await (supabase as any)
      .from("drink_tickets")
      .insert([{ event_id: eventId, guest_id: guestId }]);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("+1 ticket");
    onDone();
  };
  return (
    <Button size="sm" variant="ghost" onClick={issue} disabled={busy} className="text-sera-oxblood">
      <Ticket className="w-4 h-4 mr-1" />
      +1
    </Button>
  );
}

function PublishToggle({ event, onChanged }: { event: EventRow; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const next = event.status === "published" ? "draft" : "published";
  const click = async () => {
    setBusy(true);
    const { error } = await (supabase as any).from("events").update({ status: next }).eq("id", event.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next === "published" ? "Event published" : "Returned to draft");
    onChanged();
  };
  return (
    <Button variant={event.status === "published" ? "sera-outline" : "sera"} size="sm" disabled={busy} onClick={click}>
      {event.status === "published" ? "Unpublish" : "Publish"}
    </Button>
  );
}

function RecentRedemptions({ eventId }: { eventId: string }) {
  const { data } = useQuery({
    queryKey: ["event-redemptions", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ticket_redemptions")
        .select("id, created_at, station_label, method, guest_id, profiles!ticket_redemptions_guest_id_fkey(full_name,email)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const rows = data ?? [];

  return (
    <div className="border border-sera-sand/40 bg-sera-ivory p-5 md:p-6">
      <h3 className="font-serif text-xl text-sera-navy mb-4">Recent redemptions</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-sera-warm-grey">No redemptions yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r: any) => (
            <div
              key={r.id}
              className="flex items-center justify-between border border-sera-sand/30 bg-sera-ivory/60 p-3"
            >
              <div>
                <p className="text-sm text-sera-navy">{r.profiles?.full_name ?? r.profiles?.email ?? "Guest"}</p>
                <p className="text-[11px] text-sera-warm-grey">
                  {r.station_label ?? "Bar"} · {r.method} · {new Date(r.created_at).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="outline" className="border-sera-sand/60 text-sera-oxblood">
                Redeemed
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
