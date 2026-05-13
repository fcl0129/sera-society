import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ensureDemo, resetDemo, rpc, buildStationUrl, type DemoInfo } from "./lib";

export default function TicketTestDashboard() {
  const [demo, setDemo] = useState<DemoInfo | null>(null);
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const d = await ensureDemo();
      setDemo(d);
      const s = await rpc("tt_get_pass_state", { _pass_id: d.pass_id });
      setState(s);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const action = async (fn: () => Promise<any>) => {
    setLoading(true);
    setErr(null);
    try {
      await fn();
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const stationUrl = demo ? buildStationUrl(demo) : "";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border border-amber-500/40 bg-amber-500/10 text-amber-200 p-3 text-xs uppercase tracking-wider">
          Test Environment — isolated from production. Tables: tt_*
        </div>
        <h1 className="text-2xl">Sera Pass · Ticket Test Harness</h1>

        {err && <div className="text-red-400 text-sm border border-red-500/40 p-2">{err}</div>}

        <section className="border border-neutral-800 p-4 space-y-2">
          <div className="text-xs uppercase text-neutral-500">Demo state</div>
          {state?.ok ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><div className="text-neutral-500 text-xs">Total</div><div className="text-2xl">{state.total}</div></div>
              <div><div className="text-neutral-500 text-xs">Used</div><div className="text-2xl">{state.used}</div></div>
              <div><div className="text-neutral-500 text-xs">Remaining</div><div className="text-2xl text-emerald-400">{state.remaining}</div></div>
            </div>
          ) : <div className="text-sm text-neutral-500">Loading…</div>}
          <div className="text-xs text-neutral-500 pt-2">
            Mode: <span className="text-neutral-200">{state?.event?.tap_station_mode}</span> ·
            Manual code: <span className="text-neutral-200">{state?.pass?.manual_code}</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link className="btn" to="/ticket-test/guest">Open guest view</Link>
          <Link className="btn" to="/ticket-test/bartender">Open bartender view</Link>
          <a className="btn" href={stationUrl} target="_blank" rel="noreferrer">Open Tap Station URL</a>
          <button className="btn" onClick={() => navigator.clipboard.writeText(stationUrl)}>Copy Tap Station URL</button>
          <Link className="btn" to="/ticket-test/scan">Simulate QR scan</Link>
          <button className="btn" disabled={loading} onClick={() => action(() => resetDemo().then(setDemo))}>Reset demo (wipe + reseed)</button>
          <button className="btn" disabled={loading || !demo} onClick={() => action(() => rpc("tt_add_units", { _pass_id: demo!.pass_id, _count: 5 }))}>Add 5 fresh tickets</button>
          <button className="btn" disabled={loading || !demo} onClick={() => action(() => rpc("tt_set_mode", { _event_id: demo!.event_id, _mode: state?.event?.tap_station_mode === "auto_redeem" ? "staff_confirm" : "auto_redeem" }))}>Toggle mode</button>
        </section>

        <section className="border border-neutral-800 p-4">
          <div className="text-xs uppercase text-neutral-500 mb-2">Tap Station URL</div>
          <div className="text-xs break-all text-neutral-300">{stationUrl || "—"}</div>
          {!demo?.station_secret && (
            <div className="text-xs text-amber-400 mt-2">Station secret not stored locally — click "Reset demo" to generate a fresh one.</div>
          )}
        </section>

        <section className="border border-neutral-800 p-4">
          <div className="text-xs uppercase text-neutral-500 mb-2">Recent redemptions</div>
          <ul className="text-xs space-y-1">
            {(state?.recent ?? []).slice(0, 10).map((r: any) => (
              <li key={r.id} className="flex justify-between text-neutral-300">
                <span>{new Date(r.redeemed_at).toLocaleTimeString()} · {r.method}</span>
                <span className={r.result === "success" ? "text-emerald-400" : "text-red-400"}>{r.result}</span>
              </li>
            ))}
            {!state?.recent?.length && <li className="text-neutral-500">No redemptions yet.</li>}
          </ul>
        </section>
      </div>
      <style>{`.btn{background:#1f1f1f;border:1px solid #333;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#e5e5e5;display:block}.btn:hover{background:#2a2a2a}.btn:disabled{opacity:.5}`}</style>
    </div>
  );
}