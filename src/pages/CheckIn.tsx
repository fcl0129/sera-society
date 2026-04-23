import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EventRow { id: string; title: string; starts_at: string }
interface GuestRow { id: string; full_name: string | null; invited_email: string; rsvp_status: string }
interface CheckinRow { id: string; guest_id: string }

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
      if (!userData.user) return setErrorMessage("Sign in required.");
      const { data, error } = await (supabase as any).from("events").select("id,title,starts_at").order("starts_at", { ascending: true });
      if (error) return setErrorMessage("Could not load events.");
      const list = (data ?? []) as EventRow[];
      setEvents(list);
      if (list[0]) setSelectedEventId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    void (async () => {
      const [guestsRes, checkinsRes] = await Promise.all([
        (supabase as any).from("event_guests").select("id,full_name,invited_email,rsvp_status").eq("event_id", selectedEventId).order("full_name", { ascending: true }),
        (supabase as any).from("checkins").select("id,guest_id").eq("event_id", selectedEventId),
      ]);
      if (guestsRes.error || checkinsRes.error) return setErrorMessage("Could not load guests.");
      setGuests((guestsRes.data ?? []) as GuestRow[]);
      const map: Record<string, string> = {};
      ((checkinsRes.data ?? []) as CheckinRow[]).forEach((row) => { map[row.guest_id] = row.id; });
      setCheckins(map);
    })();
  }, [selectedEventId]);

  const toggleCheckin = async (guestId: string) => {
    if (!selectedEventId) return;
    const existing = checkins[guestId];
    if (existing) {
      const { error } = await (supabase as any).from("checkins").delete().eq("id", existing);
      if (error) return setErrorMessage("Could not undo check-in.");
      setCheckins((prev) => { const next = { ...prev }; delete next[guestId]; return next; });
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await (supabase as any).from("checkins").insert({ event_id: selectedEventId, guest_id: guestId, checked_in_by: userData.user?.id ?? null }).select("id,guest_id").single();
    if (error || !data) return setErrorMessage("Could not check in guest.");
    setCheckins((prev) => ({ ...prev, [data.guest_id]: data.id }));
  };

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader title="Guest check-in" description="Select your event and keep arrivals moving with a calm, clear list." />
      </SeraContainer>

      <SeraSection>
        <SeraContainer className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.13em]">Event</p>
              <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="min-w-[280px] border border-[#e2d2bc]/30 bg-[#0f1725]/35 px-3 py-2 text-sm text-[#f0e4d2]">
                <option value="">Select event</option>
                {events.map((event) => <option key={event.id} value={event.id}>{event.title} · {new Date(event.starts_at).toLocaleString()}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="sera-outline"><Link to="/organizer">Organizer</Link></Button>
              <Button asChild variant="sera-outline"><Link to="/ops/bartender">Bartender</Link></Button>
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-[#f2c3b9]">{errorMessage}</p> : null}

          <section className="space-y-2 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            <h2 className="font-display text-3xl text-[#f1e6d7]">{selectedEvent ? `Guests · ${selectedEvent.title}` : "Guests"}</h2>
            {guests.length === 0 ? <p>No guests to display.</p> : guests.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between gap-3 border-t border-[#e7d8c4]/15 py-3">
                <div>
                  <p className="text-[#f0e5d5]">{guest.full_name ?? guest.invited_email}</p>
                  <p className="text-xs opacity-80">{guest.invited_email} · RSVP: {guest.rsvp_status}</p>
                </div>
                <button type="button" onClick={() => void toggleCheckin(guest.id)} className="border border-[#e3d4be]/35 px-3 py-1 text-xs uppercase tracking-[0.1em]">
                  {checkins[guest.id] ? "Undo" : "Check in"}
                </button>
              </div>
            ))}
          </section>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
