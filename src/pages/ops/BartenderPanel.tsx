import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { LogOut } from "lucide-react";

type ResultState =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "already" }
  | { kind: "void" }
  | { kind: "invalid"; message: string };

export default function BartenderPanel() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [stationLabel, setStationLabel] = useState("Main Bar");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultState>({ kind: "idle" });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token.trim()) return;

    setBusy(true);
    setResult({ kind: "idle" });

    const { data, error } = await supabase.functions.invoke("redeem-ticket", {
      body: {
        token: token.trim(),
        method: "manual",
        station_label: stationLabel || null,
      },
    });

    setBusy(false);

    if (error) {
      setResult({ kind: "invalid", message: error.message });
      return;
    }

    const r = data as { ok: boolean; code: string; message?: string };
    if (r.ok) {
      setResult({ kind: "ok", message: r.message ?? "Redeemed" });
      setToken("");
    } else if (r.code === "already_redeemed") {
      setResult({ kind: "already" });
    } else if (r.code === "void") {
      setResult({ kind: "void" });
    } else {
      setResult({ kind: "invalid", message: r.message ?? "Invalid ticket" });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const palette =
    result.kind === "ok"
      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-50"
      : result.kind === "already"
      ? "border-amber-400/60 bg-amber-400/15 text-amber-50"
      : result.kind === "void" || result.kind === "invalid"
      ? "border-rose-500/60 bg-rose-500/15 text-rose-50"
      : "border-sera-sand/30 bg-sera-ivory/5 text-sera-sand";

  return (
    <div className="min-h-screen sera-gradient-navy">
      <header className="border-b border-sera-sand/15">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="sera-label text-sera-stone">Bartender</p>
            <p className="font-serif text-sera-ivory text-sm">{fullName ?? email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-sand">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="font-serif text-3xl text-sera-ivory">Redeem ticket</h1>
          <p className="text-sera-sand text-sm mt-2">Scan or paste the guest token. Server-validated.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 border border-sera-sand/25 bg-sera-ivory/5 p-4">
          <Input
            value={stationLabel}
            onChange={(e) => setStationLabel(e.target.value)}
            placeholder="Station label"
            className="h-11 bg-sera-navy/60 border-sera-sand/30 text-sera-ivory placeholder:text-sera-sand/50"
          />
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Ticket token"
            className="h-14 text-lg tracking-wider bg-sera-navy/60 border-sera-sand/30 text-sera-ivory placeholder:text-sera-sand/50"
            autoFocus
          />
          <Button type="submit" disabled={busy || !token.trim()} className="w-full h-14 text-base" variant="sera-ivory">
            {busy ? "Validating…" : "Validate & redeem"}
          </Button>
        </form>

        <section className={`border p-5 min-h-32 ${palette}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">Last result</p>
          <p className="font-serif text-3xl mt-2">
            {result.kind === "ok" && "Redeemed"}
            {result.kind === "already" && "Already redeemed"}
            {result.kind === "void" && "Voided ticket"}
            {result.kind === "invalid" && "Invalid"}
            {result.kind === "idle" && "Awaiting ticket"}
          </p>
          {result.kind === "ok" && <p className="text-sm mt-2 opacity-90">{result.message}</p>}
          {result.kind === "invalid" && <p className="text-sm mt-2 opacity-90">{result.message}</p>}
          {result.kind === "already" && <p className="text-sm mt-2 opacity-90">Don&rsquo;t serve this drink.</p>}
        </section>
      </main>
    </div>
  );
}
