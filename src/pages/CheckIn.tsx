import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  enable_qr: boolean;
  enable_nfc: boolean;
}

interface GuestRow {
  id: string;
  full_name: string;
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [nfcTagInput, setNfcTagInput] = useState("");

  const selectedEvent = useMemo(() => events.find((e) => e.id === selectedEventId) ?? null, [events, selectedEventId]);

  const loadEvents = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Du behöver vara inloggad för check-in.");
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select("id,title,starts_at,enable_qr,enable_nfc")
      .eq("organizer_id", user.id)
      .order("starts_at", { ascending: true });

    if (error) {
      setErrorMessage("Kunde inte hämta events.");
      return;
    }

    const next = (data ?? []) as EventRow[];
    setEvents(next);
    if (!selectedEventId && next.length > 0) setSelectedEventId(next[0].id);
  };

  const loadGuestsAndCheckins = async (eventId: string) => {
    if (!eventId) return;

    const [{ data: guestsData, error: guestsError }, { data: checkinsData, error: checkinsError }] = await Promise.all([
      supabase.from("guests").select("id,full_name,rsvp_status").eq("event_id", eventId).order("full_name"),
      supabase.from("checkins").select("id,guest_id").eq("event_id", eventId),
    ]);

    if (guestsError || checkinsError) {
      setErrorMessage("Kunde inte hämta gäster/check-ins.");
      return;
    }

    setGuests((guestsData ?? []) as GuestRow[]);
    const map: Record<string, string> = {};
    (checkinsData as CheckinRow[] | null)?.forEach((row) => {
      map[row.guest_id] = row.id;
    });
    setCheckins(map);
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    void loadGuestsAndCheckins(selectedEventId);
  }, [selectedEventId]);

  const handleToggleCheckin = async (guestId: string) => {
    if (!selectedEventId) return;

    const existing = checkins[guestId];
    if (existing) {
      const { error } = await supabase.from("checkins").delete().eq("id", existing);
      if (error) {
        setErrorMessage("Kunde inte ångra check-in.");
        return;
      }
      setCheckins((prev) => {
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
      .insert({ event_id: selectedEventId, guest_id: guestId, checked_in_by: user?.id ?? null })
      .select("id,guest_id")
      .single();

    if (error || !data) {
      setErrorMessage("Kunde inte checka in gäst.");
      return;
    }

    setCheckins((prev) => ({ ...prev, [data.guest_id]: data.id }));
  };

  const redeemTicket = async (mode: "qr" | "nfc") => {
    if (!selectedEvent) return;

    const value = mode === "qr" ? qrCodeInput.trim() : nfcTagInput.trim();
    if (!value) return;

    if (mode === "qr" && !selectedEvent.enable_qr) {
      setErrorMessage("QR-biljetter är inte aktiverade för detta event.");
      return;
    }

    if (mode === "nfc" && !selectedEvent.enable_nfc) {
      setErrorMessage("NFC-biljetter är inte aktiverade för detta event.");
      return;
    }

    const lookupColumn = mode === "qr" ? "ticket_code" : "nfc_tag";
    const { data, error } = await supabase
      .from("drink_tickets")
      .select("id,status")
      .eq("event_id", selectedEvent.id)
      .eq(lookupColumn, value)
      .single();

    if (error || !data) {
      setErrorMessage("Biljett hittades inte.");
      return;
    }

    if (data.status === "redeemed") {
      setErrorMessage("Biljetten är redan använd.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from("drink_tickets")
      .update({ status: "redeemed", redeemed_at: new Date().toISOString(), redeemed_by: user?.id ?? null })
      .eq("id", data.id);

    if (updateError) {
      setErrorMessage("Kunde inte lösa in biljett.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(`Biljett inlöst via ${mode.toUpperCase()}.`);
    if (mode === "qr") setQrCodeInput("");
    if (mode === "nfc") setNfcTagInput("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-5xl mx-auto px-6">
          <p className="sera-label text-sera-stone mb-4">Check-In Console</p>
          <h1 className="sera-heading text-sera-ivory text-4xl md:text-5xl mb-3">Live guest check-in</h1>
          <p className="sera-body text-sera-sand text-lg max-w-2xl">
            Välj event och checka in gäster i realtid.
          </p>
        </div>
      </section>

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
                  <option value="">Välj event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} · {new Date(event.starts_at).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <Button asChild variant="sera-outline">
                <Link to="/dashboard/events">Manage events</Link>
              </Button>
            </div>
            {errorMessage && <p className="text-xs text-red-700 mt-3">{errorMessage}</p>}
            {successMessage && <p className="text-xs text-green-700 mt-2">{successMessage}</p>}
          </div>

          {selectedEvent && (
            <div className="bg-sera-ivory/60 border border-sera-sand/60 p-6 mb-6">
              <h3 className="font-serif text-sera-navy text-xl mb-3">Drink ticket redemption</h3>
              <p className="text-xs text-sera-warm-grey mb-4">
                Modes: QR {selectedEvent.enable_qr ? "enabled" : "disabled"} · NFC {selectedEvent.enable_nfc ? "enabled" : "disabled"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex gap-2">
                  <input
                    className="border border-sera-sand bg-sera-ivory px-3 py-2 text-sm w-full"
                    placeholder="Scan/enter QR code"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                  />
                  <button type="button" className="text-xs border border-sera-sand px-3 py-2" onClick={() => void redeemTicket("qr")}>
                    Redeem QR
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    className="border border-sera-sand bg-sera-ivory px-3 py-2 text-sm w-full"
                    placeholder="Tap/enter NFC tag"
                    value={nfcTagInput}
                    onChange={(e) => setNfcTagInput(e.target.value)}
                  />
                  <button type="button" className="text-xs border border-sera-sand px-3 py-2" onClick={() => void redeemTicket("nfc")}>
                    Redeem NFC
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <h2 className="font-serif text-sera-navy text-2xl mb-4">
              {selectedEvent ? `Guests for ${selectedEvent.title}` : "Guests"}
            </h2>

            {guests.length === 0 ? (
              <p className="sera-body text-sera-warm-grey text-sm">Inga gäster att visa.</p>
            ) : (
              <div className="space-y-2">
                {guests.map((guest) => (
                  <div key={guest.id} className="border border-sera-sand/50 bg-sera-ivory p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-sans text-sm font-medium text-sera-navy">{guest.full_name}</p>
                      <p className="text-xs text-sera-warm-grey">RSVP: {guest.rsvp_status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleCheckin(guest.id)}
                      className="text-xs border border-sera-sand px-3 py-1"
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
