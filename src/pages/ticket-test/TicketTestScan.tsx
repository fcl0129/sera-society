import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ensureDemo, rpc } from "./lib";

export default function TicketTestScan() {
  const [params] = useSearchParams();
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let passId = params.get("pass");
        if (!passId) {
          const d = await ensureDemo();
          passId = d.pass_id;
        }
        const r = await rpc("tt_redeem_qr", { _pass_id: passId });
        setResult(r);
      } catch (e: any) { setErr(e.message); }
    })();
  }, [params]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6">
      <div className="max-w-md mx-auto space-y-5 pt-12">
        <div className="text-xs uppercase text-neutral-500">Simulated QR scan</div>
        {result?.ok && (
          <div className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 p-6 text-center">
            <div className="text-2xl">Redeemed</div>
            <div className="text-sm mt-2">{result.remaining} of {result.total} remaining</div>
          </div>
        )}
        {result && !result.ok && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 p-6 text-center">
            <div className="text-2xl">{result.code === "no_tickets_remaining" ? "No drink tickets remaining" : (result.code ?? "Error")}</div>
          </div>
        )}
        {err && <div className="text-red-400 text-xs">{err}</div>}
        <Link to="/ticket-test" className="block text-xs text-neutral-500">← test dashboard</Link>
        <Link to="/ticket-test/guest" className="block text-xs text-neutral-500">→ guest view</Link>
      </div>
    </div>
  );
}