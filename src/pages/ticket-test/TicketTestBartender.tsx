import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ensureDemo, rpc, type DemoInfo } from "./lib";

export default function TicketTestBartender() {
  const [demo, setDemo] = useState<DemoInfo | null>(null);
  const [state, setState] = useState<any>(null);
  const [manual, setManual] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      const d = demo ?? (await ensureDemo());
      if (!demo) setDemo(d);
      const s = await rpc("tt_get_bartender_state", { _event_slug: "ticket-test" });
      setState(s);
    } catch (e: any) { setMsg(e.message); }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirm = async (intentId: string) => {
    const r: any = await rpc("tt_confirm_intent", { _intent_id: intentId });
    setMsg(r.ok ? `Served · remaining ${r.remaining}` : r.code);
    load();
  };
  const reject = async (intentId: string) => {
    await rpc("tt_reject_intent", { _intent_id: intentId });
    setMsg("Rejected");
    load();
  };
  const simulateQr = async () => {
    if (!demo) return;
    const r: any = await rpc("tt_redeem_qr", { _pass_id: demo.pass_id });
    setMsg(r.ok ? `Scan Pass redeemed · remaining ${r.remaining}` : r.code);
    load();
  };
  const submitManual = async () => {
    const r: any = await rpc("tt_redeem_manual", { _manual_code: manual });
    setMsg(r.ok ? `Guest Lookup redeemed · remaining ${r.remaining}` : r.code);
    setManual("");
    load();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <Link to="/ticket-test" className="text-xs text-neutral-500">← back to test dashboard</Link>
        <h1 className="text-xl">Bar Mode · Bar 1 ({state?.event?.tap_station_mode})</h1>

        {msg && <div className="text-xs border border-neutral-700 p-2 text-neutral-300">{msg}</div>}

        <section className="border border-neutral-800 p-4">
          <div className="text-xs uppercase text-neutral-500 mb-2">Pending confirmations</div>
          {state?.pending?.length ? state.pending.map((row: any) => (
            <div key={row.intent.id} className="flex items-center justify-between py-2 border-t border-neutral-800 first:border-0">
              <div>
                <div className="text-sm">{row.pass.display_name}</div>
                <div className="text-xs text-neutral-500">{row.remaining} tickets remaining · tapped {new Date(row.intent.tapped_at).toLocaleTimeString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="bg-emerald-600 text-neutral-950 px-3 py-1 text-xs uppercase" onClick={() => confirm(row.intent.id)}>Confirm served</button>
                <button className="border border-neutral-700 px-3 py-1 text-xs uppercase" onClick={() => reject(row.intent.id)}>Reject</button>
              </div>
            </div>
          )) : <div className="text-xs text-neutral-500">No guests waiting.</div>}
        </section>

        <section className="grid grid-cols-2 gap-3">
          <button className="btn" onClick={simulateQr}>Simulate Scan Pass for Demo Guest</button>
          <div className="flex gap-2">
            <input value={manual} onChange={e => setManual(e.target.value)} placeholder="Guest Lookup code" className="flex-1 bg-neutral-900 border border-neutral-700 px-2 py-2 text-sm uppercase tracking-widest" />
            <button className="btn" onClick={submitManual} disabled={!manual}>Redeem</button>
          </div>
        </section>

        <section className="border border-neutral-800 p-4">
          <div className="text-xs uppercase text-neutral-500 mb-2">Recent activity</div>
          <ul className="text-xs space-y-1">
            {(state?.recent ?? []).map((r: any) => (
              <li key={r.redemption.id} className="flex justify-between text-neutral-300">
                <span>{new Date(r.redemption.redeemed_at).toLocaleTimeString()} · {r.pass_name ?? "—"} · {r.redemption.method}</span>
                <span className={r.redemption.result === "success" ? "text-emerald-400" : "text-red-400"}>{r.redemption.result}</span>
              </li>
            ))}
            {!state?.recent?.length && <li className="text-neutral-500">No activity.</li>}
          </ul>
        </section>
      </div>
      <style>{`.btn{background:#1f1f1f;border:1px solid #333;padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#e5e5e5}.btn:hover{background:#2a2a2a}.btn:disabled{opacity:.4}`}</style>
    </div>
  );
}