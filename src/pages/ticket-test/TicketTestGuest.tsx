import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ensureDemo, rpc, type DemoInfo } from "./lib";

function useCountdown(target: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  if (!target) return 0;
  return Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
}

export default function TicketTestGuest() {
  const [demo, setDemo] = useState<DemoInfo | null>(null);
  const [state, setState] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const intent = state?.active_intent;
  const seconds = useCountdown(intent?.expires_at ?? null);

  const load = async () => {
    try {
      const d = demo ?? (await ensureDemo());
      if (!demo) setDemo(d);
      const s = await rpc("tt_get_pass_state", { _pass_id: d.pass_id });
      setState(s);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = state?.remaining ?? 0;
  const qrUrl = demo
    ? `${window.location.origin}/ticket-test/scan?pass=${demo.pass_id}`
    : "";

  const useTicket = async () => {
    setErr(null);
    try {
      const r: any = await rpc("tt_create_intent", { _pass_id: demo!.pass_id });
      if (!r.ok) setErr(r.code);
      await load();
    } catch (e: any) { setErr(e.message); }
  };

  const cancel = async () => {
    if (!intent) return;
    await rpc("tt_cancel_intent", { _intent_id: intent.id });
    await load();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6">
      <div className="max-w-md mx-auto space-y-5">
        <Link to="/ticket-test" className="text-xs text-neutral-500">← back to test dashboard</Link>
        <h1 className="text-xl">Sera Pass · Demo Guest</h1>

        <div className="border border-neutral-800 p-5 text-center">
          <div className="text-6xl font-light">{remaining}</div>
          <div className="text-xs uppercase tracking-wider text-neutral-500 mt-1">
            {remaining === 0 ? "All drink tickets used" : `drink ticket${remaining === 1 ? "" : "s"} remaining`}
          </div>
          <div className="text-xs text-neutral-500 mt-2">{state?.used ?? 0} used · {state?.total ?? 0} total</div>
        </div>

        {intent && intent.status === "pending" && (
          <div className="border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
            <div className="text-emerald-300 text-sm uppercase tracking-wider">Ready to tap</div>
            <div className="text-3xl mt-1">{seconds}s</div>
            <div className="text-xs text-neutral-400 mt-1">Open the TapStation URL on this device or another.</div>
            <button className="btn mt-3" onClick={cancel}>Cancel</button>
          </div>
        )}
        {intent && intent.status === "awaiting_staff_confirmation" && (
          <div className="border border-amber-500/40 bg-amber-500/10 p-4 text-center">
            <div className="text-amber-200 text-sm uppercase tracking-wider">Awaiting staff confirmation</div>
            <button className="btn mt-3" onClick={cancel}>Cancel</button>
          </div>
        )}

        {!intent && (
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 py-4 text-sm uppercase tracking-wider"
            disabled={remaining === 0}
            onClick={useTicket}
          >
            {remaining === 0 ? "No drink tickets remaining" : "Use drink ticket"}
          </button>
        )}

        <div className="border border-neutral-800 p-4 flex flex-col items-center gap-2">
          <div className="text-xs uppercase text-neutral-500">Scan Pass</div>
          {qrUrl && <div className="bg-white p-3"><QRCodeSVG value={qrUrl} size={160} /></div>}
          <div className="text-xs text-neutral-400">Guest Lookup code: <span className="text-neutral-100 tracking-widest">{state?.pass?.manual_code ?? "—"}</span></div>
        </div>

        {err && <div className="text-red-400 text-xs">{err}</div>}
      </div>
      <style>{`.btn{background:#1f1f1f;border:1px solid #333;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#e5e5e5}`}</style>
    </div>
  );
}