import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { detectNfcCapability, startNfcRead } from "@/lib/nfc";
import { redeemTicket, type RedemptionResponse } from "@/lib/redemption";
import { LogOut, RefreshCcw, Smartphone, Ticket } from "lucide-react";
import QrScanner from "@/components/ops/QrScanner";

export default function BartenderPanel() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [result, setResult] = useState<RedemptionResponse | null>(null);
  const [nfcListening, setNfcListening] = useState(false);

  const nfcCap = useMemo(() => detectNfcCapability(), []);

  const handleRedeem = async (code: string, method: "qr" | "nfc" | "manual") => {
    if (!code || busy || scanLocked) return;

    setBusy(true);
    setScanLocked(true);

    try {
      const redemption = await redeemTicket({
        token: code,
        method,
        stationLabel: "bartender_panel",
      });
      setResult(redemption);
      if (navigator.vibrate) navigator.vibrate(redemption.ok ? [80] : [40, 80, 40]);
    } catch (error) {
      setResult({ ok: false, code: "invalid", message: error instanceof Error ? error.message : "Scan failed" });
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!manualCode.trim()) return;
    await handleRedeem(manualCode.trim(), "manual");
    setManualCode("");
  };

  const beginNfcRead = async () => {
    setNfcListening(true);
    const stop = await startNfcRead(
      async (tap) => {
        const payload = tap.payload?.trim();
        if (payload) await handleRedeem(payload, "nfc");
        setNfcListening(false);
        stop();
      },
      () => {
        setNfcListening(false);
      }
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen sera-gradient-navy">
      <header className="border-b border-sera-sand/15">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="sera-label text-sera-stone">Bartender mode</p>
            <p className="font-serif text-sera-ivory text-sm">{fullName ?? email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-sand">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <QrScanner onDetected={(value) => void handleRedeem(value, "qr")} paused={scanLocked || busy} />

        <form onSubmit={onSubmit} className="space-y-2 border border-sera-sand/25 bg-sera-ivory/5 p-4">
          <label className="text-xs text-sera-sand uppercase tracking-[0.15em]">Manual lookup</label>
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter ticket code"
            className="h-12 text-lg bg-sera-navy/60 border-sera-sand/30 text-sera-ivory placeholder:text-sera-sand/50"
          />
          <Button type="submit" disabled={busy || !manualCode.trim()} className="w-full" variant="sera-ivory">
            <Ticket className="h-4 w-4 mr-2" />
            Validate code
          </Button>
        </form>

        {nfcCap.supported ? (
          <Button type="button" onClick={() => void beginNfcRead()} disabled={busy || nfcListening} className="w-full" variant="sera-outline">
            <Smartphone className="h-4 w-4 mr-2" />
            {nfcListening ? "Listening for NFC…" : "NFC read (Android Chrome)"}
          </Button>
        ) : (
          <p className="text-xs text-sera-sand/80">NFC is unsupported on this browser. Continue with QR/manual flow.</p>
        )}

        <section className="border border-sera-sand/25 bg-sera-ivory/5 p-4 text-sera-ivory">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sera-sand">Result</p>
          <p className="font-serif text-2xl mt-2">
            {!result && "Awaiting scan"}
            {result?.ok && "Redeemed"}
            {!result?.ok && result?.code === "already_redeemed" && "Already used"}
            {!result?.ok && result?.code === "invalid" && "Invalid"}
            {!result?.ok && result?.code === "void" && "Void"}
            {!result?.ok && result?.code === "forbidden" && "Not authorized"}
            {!result?.ok && result?.code === "unauthorized" && "Sign in required"}
          </p>
          <p className="text-sm opacity-90 mt-1">{result?.message ?? "Scan a QR code or enter a code manually."}</p>

          <Button type="button" variant="ghost" className="mt-3 text-sera-sand" onClick={() => setScanLocked(false)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Scan next
          </Button>
        </section>
      </main>
    </div>
  );
}
