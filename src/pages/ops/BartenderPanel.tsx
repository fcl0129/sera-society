import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redeemTicketByCode } from "@/lib/event-ops";

type ResultState = {
  status: "idle" | "redeemed" | "already_redeemed" | "invalid";
  message: string;
  at?: string | null;
};

export default function BartenderPanel() {
  const [eventId, setEventId] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [stationLabel, setStationLabel] = useState("Main Bar");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState>({ status: "idle", message: "Ready" });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!eventId || !ticketCode) return;

    setLoading(true);
    try {
      const redemption = await redeemTicketByCode({ eventId, ticketCode, stationLabel });
      setResult({
        status: redemption.status,
        message: redemption.message,
        at: redemption.redeemed_at,
      });
      setTicketCode("");
    } catch (error) {
      setResult({
        status: "invalid",
        message: error instanceof Error ? error.message : "Invalid ticket",
      });
    } finally {
      setLoading(false);
    }
  };

  const resultClass =
    result.status === "redeemed"
      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-100"
      : result.status === "already_redeemed"
        ? "border-amber-400/60 bg-amber-400/10 text-amber-100"
        : result.status === "invalid"
          ? "border-rose-500/60 bg-rose-500/10 text-rose-100"
          : "border-sera-sand/30 bg-sera-ivory/5 text-sera-sand";

  return (
    <div className="min-h-screen bg-sera-midnight">
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <header className="px-1">
          <p className="sera-label text-sera-stone">Bartender tools</p>
          <h1 className="font-serif text-3xl text-sera-ivory mt-2">Redeem drink ticket</h1>
          <p className="text-sera-sand text-sm mt-2">Fast single-field redemption built for high-throughput bar service.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-3 border border-sera-sand/30 bg-sera-ivory/5 p-4 rounded-xl">
          <Input value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Event ID" className="h-12 text-base" required />
          <Input value={stationLabel} onChange={(e) => setStationLabel(e.target.value)} placeholder="Station label" className="h-12 text-base" />
          <Input
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            placeholder="Ticket code"
            className="h-14 text-lg tracking-wider"
            required
            autoFocus
          />
          <Button type="submit" disabled={loading} className="w-full h-14 text-base" variant="sera">
            {loading ? "Checking..." : "Validate & Redeem"}
          </Button>
        </form>

        <section className={`rounded-xl border p-4 min-h-32 ${resultClass}`}>
          <p className="text-xs uppercase tracking-[0.18em] opacity-80">Result</p>
          <p className="font-serif text-3xl mt-3">
            {result.status === "redeemed" && "Redeemed"}
            {result.status === "already_redeemed" && "Already redeemed"}
            {result.status === "invalid" && "Invalid ticket"}
            {result.status === "idle" && "Awaiting ticket"}
          </p>
          <p className="text-sm mt-2">{result.message}</p>
          {result.at && <p className="text-xs mt-2 opacity-80">{new Date(result.at).toLocaleTimeString()}</p>}
        </section>
      </main>
    </div>
  );
}
