// @ts-nocheck — legacy schema references; will be regenerated when platform tables exist
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type RsvpStatus = "pending" | "yes" | "no" | "maybe";

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  venue: string | null;
  status: string;
  capacity: number | null;
  enable_qr: boolean;
  enable_nfc: boolean;
}

interface GuestRow {
  id: string;
  full_name: string;
  email: string | null;
  rsvp_status: RsvpStatus;
}

interface CheckinRow {
  id: string;
  guest_id: string;
}

interface DrinkTicketRow {
  id: string;
  guest_id: string | null;
  status: string;
}

export default function ManageEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [checkinsByGuest, setCheckinsByGuest] = useState<Record<string, string>>({});
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [ticketsByGuest, setTicketsByGuest] = useState<Record<string, number>>({});

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [events],
  );

  const selectedEvent = useMemo(
    () => sortedEvents.find((event) => event.id === selectedEventId) ?? null,
    [sortedEvents, selectedEventId],
  );

  const guestStats = useMemo(() => {
    const pending = guests.filter((g) => g.rsvp_status === "pending").length;
    const yes = guests.filter((g) => g.rsvp_status === "yes").length;
    const checkedIn = guests.filter((g) => checkinsByGuest[g.id]).length;
    return { pending, yes, checkedIn };
  }, [guests, checkinsByGuest]);

  const loadEvents = async () => {
    setLoading(true);
    setErrorMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Kunde inte läsa användarsession. Logga in igen.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select("id,title,starts_at,venue,status,capacity,enable_qr,enable_nfc")
      .eq("organizer_id", user.id)
      .order("starts_at", { ascending: true });

    if (error) {
      setErrorMessage("Kunde inte hämta events just nu.");
      setLoading(false);
      return;
    }

    const nextEvents = (data ?? []) as EventRow[];
    setEvents(nextEvents);
    if (!selectedEventId && nextEvents.length > 0) {
      setSelectedEventId(nextEvents[0].id);
    }
    setLoading(false);
  };

  const loadGuestsForEvent = async (eventId: string) => {
    if (!eventId) {
      setGuests([]);
      setCheckinsByGuest({});
      setTicketsByGuest({});
      return;
    }

    setLoadingGuests(true);
    setErrorMessage(null);

    const [{ data: guestsData, error: guestsError }, { data: checkinsData, error: checkinsError }, { data: ticketData, error: ticketError }] = await Promise.all([
      supabase.from("guests").select("id,full_name,email,rsvp_status").eq("event_id", eventId).order("created_at", { ascending: false }),
      supabase.from("checkins").select("id,guest_id").eq("event_id", eventId),
      supabase.from("drink_tickets").select("id,guest_id,status").eq("event_id", eventId).neq("status", "void"),
    ]);

    if (guestsError || checkinsError || ticketError) {
      setErrorMessage("Kunde inte läsa gäster/check-ins just nu.");
      setLoadingGuests(false);
      return;
    }

    setGuests((guestsData ?? []) as GuestRow[]);
    const map: Record<string, string> = {};
    (checkinsData as CheckinRow[] | null)?.forEach((row) => {
      map[row.guest_id] = row.id;
    });
    setCheckinsByGuest(map);

    const ticketCountMap: Record<string, number> = {};
    (ticketData as DrinkTicketRow[] | null)?.forEach((ticket) => {
      if (!ticket.guest_id) return;
      ticketCountMap[ticket.guest_id] = (ticketCountMap[ticket.guest_id] ?? 0) + 1;
    });
    setTicketsByGuest(ticketCountMap);
    setLoadingGuests(false);
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    void loadGuestsForEvent(selectedEventId);
  }, [selectedEventId]);

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Du behöver vara inloggad för att skapa event.");
      setIsSaving(false);
      return;
    }

    const startsAtIso = new Date(startsAt).toISOString();
    const endsAtIso = endsAt ? new Date(endsAt).toISOString() : null;

    const { error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title,
      venue: venue || null,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      capacity: capacity ? Number(capacity) : null,
      status: "draft",
    });

    if (error) {
      setErrorMessage(error.message || "Kunde inte skapa event just nu.");
      setIsSaving(false);
      return;
    }

    setSuccessMessage("Event skapat!");
    setTitle("");
    setVenue("");
    setStartsAt("");
    setEndsAt("");
    setCapacity("");
    setIsSaving(false);
    await loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Är du säker på att du vill radera detta event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      setErrorMessage("Kunde inte radera event.");
      return;
    }

    setSuccessMessage("Event raderat.");
    if (selectedEventId === eventId) {
      setSelectedEventId("");
      setGuests([]);
      setCheckinsByGuest({});
      setTicketsByGuest({});
    }
    await loadEvents();
  };

  const handlePublishToggle = async (event: EventRow) => {
    const nextStatus = event.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("events").update({ status: nextStatus }).eq("id", event.id);

    if (error) {
      setErrorMessage("Kunde inte uppdatera status.");
      return;
    }

    setSuccessMessage(`Event markerat som ${nextStatus}.`);
    await loadEvents();
  };

  const handleTicketModeToggle = async (mode: "qr" | "nfc", value: boolean) => {
    if (!selectedEventId) return;
    const payload = mode === "qr" ? { enable_qr: value } : { enable_nfc: value };
    const { error } = await supabase.from("events").update(payload).eq("id", selectedEventId);

    if (error) {
      setErrorMessage("Kunde inte uppdatera biljettläge.");
      return;
    }

    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEventId
          ? {
              ...event,
              enable_qr: mode === "qr" ? value : event.enable_qr,
              enable_nfc: mode === "nfc" ? value : event.enable_nfc,
            }
          : event,
      ),
    );
  };

  const handleAddGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    const { error } = await supabase.from("guests").insert({
      event_id: selectedEventId,
      full_name: guestName,
      email: guestEmail || null,
      rsvp_status: "pending",
    });

    if (error) {
      setErrorMessage("Kunde inte lägga till gäst.");
      return;
    }

    setGuestName("");
    setGuestEmail("");
    setSuccessMessage("Gäst tillagd.");
    await loadGuestsForEvent(selectedEventId);
  };

  const handleRsvpChange = async (guestId: string, status: RsvpStatus) => {
    const { error } = await supabase.from("guests").update({ rsvp_status: status }).eq("id", guestId);
    if (error) {
      setErrorMessage("Kunde inte uppdatera RSVP.");
      return;
    }

    setGuests((prev) => prev.map((guest) => (guest.id === guestId ? { ...guest, rsvp_status: status } : guest)));
  };

  const handleCheckinToggle = async (guestId: string) => {
    if (!selectedEventId) return;

    const existingCheckinId = checkinsByGuest[guestId];

    if (existingCheckinId) {
      const { error } = await supabase.from("checkins").delete().eq("id", existingCheckinId);
      if (error) {
        setErrorMessage("Kunde inte ångra check-in.");
        return;
      }
      setCheckinsByGuest((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("checkins")
      .insert({
        event_id: selectedEventId,
        guest_id: guestId,
        checked_in_by: user?.id ?? null,
      })
      .select("id,guest_id")
      .single();

    if (error || !data) {
      setErrorMessage("Kunde inte checka in gäst.");
      return;
    }

    setCheckinsByGuest((prev) => ({ ...prev, [data.guest_id]: data.id }));
  };

  const generateTicketCode = () => `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const generateNfcTag = () => `NFC-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

  const handleIssueTicket = async (guestId: string) => {
    if (!selectedEvent) return;

    const payload = {
      event_id: selectedEvent.id,
      guest_id: guestId,
      ticket_code: selectedEvent.enable_qr ? generateTicketCode() : generateNfcTag(),
      nfc_tag: selectedEvent.enable_nfc ? generateNfcTag() : null,
      status: "issued",
    };

    const { error } = await supabase.from("drink_tickets").insert(payload);
    if (error) {
      setErrorMessage("Kunde inte utfärda drinkbiljett.");
      return;
    }

    setTicketsByGuest((prev) => ({ ...prev, [guestId]: (prev[guestId] ?? 0) + 1 }));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-6xl mx-auto px-6">
          <p className="sera-label text-sera-stone mb-4">Organizer Dashboard</p>
          <h1 className="sera-heading text-sera-ivory text-4xl md:text-5xl mb-3">Create & manage events</h1>
          <p className="sera-body text-sera-sand text-lg max-w-2xl">
            Fullt arbetsflöde: skapa event, hantera gäster, uppdatera RSVP och checka in i realtid.
          </p>
        </div>
      </section>

      <section className="py-16 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-sera-ivory/60 border border-sera-sand/60 p-6">
            <h2 className="font-serif text-sera-navy text-2xl mb-5">New event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Venue</Label>
                <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Starts at</Label>
                <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Ends at (optional)</Label>
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Capacity (optional)</Label>
                <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>

              {errorMessage && <p className="text-xs text-red-700">{errorMessage}</p>}
              {successMessage && <p className="text-xs text-green-700">{successMessage}</p>}

              <Button variant="sera" size="lg" className="w-full" type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create event"}
              </Button>
            </form>
          </div>

          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-sera-navy text-2xl">Your events</h2>
              <Link className="text-xs text-sera-oxblood underline underline-offset-4" to="/dashboard">
                Back to dashboard
              </Link>
            </div>

            {loading ? (
              <p className="sera-body text-sera-warm-grey text-sm">Loading events…</p>
            ) : sortedEvents.length === 0 ? (
              <p className="sera-body text-sera-warm-grey text-sm">Inga events ännu.</p>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`border p-4 ${selectedEventId === event.id ? "border-sera-oxblood bg-sera-ivory" : "border-sera-sand/50 bg-sera-ivory/80"}`}
                  >
                    <button type="button" className="text-left w-full" onClick={() => setSelectedEventId(event.id)}>
                      <p className="font-sans text-sm font-medium text-sera-navy">{event.title}</p>
                      <p className="text-xs text-sera-warm-grey mt-1">
                        {new Date(event.starts_at).toLocaleString()} {event.venue ? `• ${event.venue}` : ""}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-sera-stone mt-2">{event.status}</p>
                    </button>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handlePublishToggle(event)}
                        className="text-[10px] uppercase tracking-wider border border-sera-sand px-2 py-1"
                      >
                        {event.status === "published" ? "Set draft" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-[10px] uppercase tracking-wider border border-red-300 text-red-700 px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-10">
          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <h3 className="font-serif text-sera-navy text-2xl">
                Guests & RSVP {selectedEvent ? `for ${selectedEvent.title}` : ""}
              </h3>
              {selectedEvent && (
                <div className="text-xs text-sera-warm-grey">
                  Pending: {guestStats.pending} · Yes: {guestStats.yes} · Checked-in: {guestStats.checkedIn}
                </div>
              )}
            </div>

            {!selectedEvent ? (
              <p className="sera-body text-sera-warm-grey text-sm">Välj ett event ovan för att hantera gäster.</p>
            ) : (
              <>
                <div className="mb-4 p-3 border border-sera-sand/50 bg-sera-ivory/80">
                  <p className="text-xs uppercase tracking-wider text-sera-stone mb-2">Drink ticket configuration</p>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEvent.enable_qr}
                        onChange={(e) => handleTicketModeToggle("qr", e.target.checked)}
                      />
                      Enable QR tickets
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEvent.enable_nfc}
                        onChange={(e) => handleTicketModeToggle("nfc", e.target.checked)}
                      />
                      Enable NFC tags
                    </label>
                  </div>
                </div>

                <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <Input placeholder="Guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                  <Input placeholder="Guest email (optional)" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                  <Button type="submit" variant="sera">Add guest</Button>
                </form>

                {loadingGuests ? (
                  <p className="sera-body text-sera-warm-grey text-sm">Loading guests…</p>
                ) : guests.length === 0 ? (
                  <p className="sera-body text-sera-warm-grey text-sm">Inga gäster ännu.</p>
                ) : (
                  <div className="space-y-2">
                    {guests.map((guest) => (
                      <div key={guest.id} className="border border-sera-sand/50 bg-sera-ivory p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-sans text-sm font-medium text-sera-navy">{guest.full_name}</p>
                          <p className="text-xs text-sera-warm-grey">{guest.email || "No email"}</p>
                          <p className="text-[10px] uppercase tracking-wider text-sera-stone mt-1">
                            Drink tickets: {ticketsByGuest[guest.id] ?? 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={guest.rsvp_status}
                            onChange={(e) => handleRsvpChange(guest.id, e.target.value as RsvpStatus)}
                            className="border border-sera-sand bg-sera-ivory px-2 py-1 text-xs"
                          >
                            <option value="pending">pending</option>
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                            <option value="maybe">maybe</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleCheckinToggle(guest.id)}
                            className="text-xs border border-sera-sand px-2 py-1"
                          >
                            {checkinsByGuest[guest.id] ? "Undo check-in" : "Check in"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleIssueTicket(guest.id)}
                            className="text-xs border border-sera-sand px-2 py-1"
                          >
                            Issue ticket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
