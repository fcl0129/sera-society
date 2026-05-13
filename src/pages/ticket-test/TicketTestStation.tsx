import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ensureDemo, rpc } from "./lib";

export default function TicketTestStation() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const secret = params.get("s") ?? "";
        let passId = params.get("pass");
        if (!passId) {
          const d = await ensureDemo();
          passId = d.pass_id;
        }
        const r: any = await rpc("tt_tap_station", {
          _station_slug: slug,
          _station_secret: secret,
          _pass_id: passId,
        });
        setResult(r);
      } catch (e: any) { setErr(e.message); }
    })();
  }, [slug, params]);

  let title = "Tap Station";
  let body = "Processing…";
  let tone = "neutral";
  if (result) {
    if (result.ok) {
      if (result.mode === "auto_redeem") {
        title = "Drink ticket redeemed";
        body = `${result.remaining} of ${result.total} remaining`;
        tone = "ok";
      } else {
        title = "Awaiting bartender";
        body = "Hand the bartender your phone or wait for confirmation.";
        tone = "warn";
      }
    } else if (result.code === "no_active_intent") {
      title = "No active drink ticket";
      body = "Press 'Use drink ticket' on your pass first, then tap the station within 90 seconds.";
      tone = "warn";
    } else if (result.code === "no_tickets_remaining") {
      title = "No drink tickets remaining";
      body = "Your pass has no remaining tickets.";
      tone = "err";
    } else if (result.code === "unauthorized" || result.code === "invalid_station") {
      title = "Invalid station";
      body = "This station URL is not valid.";
      tone = "err";
    } else {
      title = result.code ?? "Error";
      body = result.message ?? "";
      tone = "err";
    }
  }

  const color = tone === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
    : tone === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
    : tone === "err" ? "border-red-500/40 bg-red-500/10 text-red-200"
    : "border-neutral-800 text-neutral-300";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6">
      <div className="max-w-md mx-auto space-y-5 pt-12">
        <div className="text-xs uppercase text-neutral-500">Tap Station · {slug}</div>
        <div className={`border p-6 text-center ${color}`}>
          <div className="text-2xl">{title}</div>
          <div className="text-sm mt-2 opacity-80">{body}</div>
        </div>
        {err && <div className="text-red-400 text-xs">{err}</div>}
        <Link to="/ticket-test" className="block text-xs text-neutral-500">← test dashboard</Link>
      </div>
    </div>
  );
}