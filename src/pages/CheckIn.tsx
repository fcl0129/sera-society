import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/PageHero";

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
}

interface GuestRow {
  id: string;
  full_name: string | null;
  invited_email: string;
  rsvp_status: string;
}

interface CheckinRow {
  id: string;
  guest_id: string;
}

export default function CheckIn() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [checkins, setCheckins] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setErrorMessage("Sign in required.");
        return;
      }
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id,title,starts_at")
        .order("starts_at", { ascending: true });
      if (error) {
        setErrorMessage("Could not load events.");
        return;
      }
      const list = (data ?? []) as EventRow[];
      setEvents(list);
      if (list.length > 0) setSelectedEventId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    void (async () => {
      const [guestsRes, checkinsRes] = await Promise.all([
        (supabase as any)
          .from("event_guests")
          .select("id,full_name,invited_email,rsvp_status")
          .eq("event_id", selectedEventId)
          .order("full_name", { ascending: true }),
        (supabase as any).from("checkins").select("id,guest_id").eq("event_id", selectedEventId),
      ]);
      if (guestsRes.error || checkinsRes.error) {
        setErrorMessage("Could not load guests / check-ins.");
        return;
      }
      setGuests((guestsRes.data ?? []) as GuestRow[]);
      const map: Record<string, string> = {};
      ((checkinsRes.data ?? []) as CheckinRow[]).forEach((row) => {
        map[row.guest_id] = row.id;
      });
      setCheckins(map);
    })();
  }, [selectedEventId]);

  const toggleCheckin = async (guestId: string) => {
    if (!selectedEventId) return;
    const existing = checkins[guestId];

    if (existing) {
      const { error } = await (supabase as any).from("checkins").delete().eq("id", existing);
      if (error) {
        setErrorMessage("Could not undo check-in.");
        return;
      }
      setCheckins((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await (supabase as any)
      .from("checkins")
      .insert({ event_id: selectedEventId, guest_id: guestId, checked_in_by: userData.user?.id ?? null })
      .select("id,guest_id")
      .single();

    if (error || !data) {
      setErrorMessage(error?.message?.includes("duplicate") ? "Already checked in." : "Could not check in guest.");
      return;
    }
    setCheckins((prev) => ({ ...prev, [data.guest_id]: data.id }));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageHero
        eyebrow="Check-In Console"
        align="left"
        width="narrow"
        title="Live guest check-in"
        description="Pick an event and check guests in as they arrive."
      />

      <section className="py-16 sera-surface-light">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-sera-ivory/60 border border-sera-sand/60 p-6 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-sera-warm-grey mb-2">Event</p>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="border border-sera-sand bg-sera-ivory px-3 py-2 text-sm min-w-[260px]"
                >
                  <option value="">Select event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} · {new Date(event.starts_at).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="sera-outline">
                  <Link to="/organizer">Organizer dashboard</Link>
                </Button>
                <Button asChild variant="sera-outline">
                  <Link to="/ops/bartender">Bartender mode</Link>
                </Button>
              </div>
            </div>
            {errorMessage && <p className="text-xs text-red-700 mt-3">{errorMessage}</p>}
          </div>

          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <h2 className="font-serif text-sera-navy text-2xl mb-4">
              {selectedEvent ? `Guests for ${selectedEvent.title}` : "Guests"}
            </h2>

            {guests.length === 0 ? (
              <p className="sera-body text-sera-warm-grey text-sm">No guests to display.</p>
            ) : (
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="border border-sera-sand/50 bg-sera-ivory p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-sans text-sm font-medium text-sera-navy">
                        {guest.full_name ?? guest.invited_email}
                      </p>
                      <p className="text-xs text-sera-warm-grey">
                        {guest.invited_email} · RSVP: {guest.rsvp_status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleCheckin(guest.id)}
                      className={`text-xs border px-3 py-1 ${
                        checkins[guest.id]
                          ? "border-sera-oxblood text-sera-oxblood"
                          : "border-sera-sand text-sera-navy"
                      }`}
                    >
                      {checkins[guest.id] ? "Undo check-in" : "Check in"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
