import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { detectNfcCapability, startNfcRead } from "@/lib/nfc";
import { redeemTicket, normalizeScannedTicketValue, type RedemptionResponse } from "@/lib/redemption";
import { LogOut, RefreshCcw, Smartphone, Ticket, ScanLine } from "lucide-react";
import QrScanner from "@/components/ops/QrScanner";
import { RedemptionReceipt, type ReceiptData, receiptStatusFromCode } from "@/components/ops/RedemptionReceipt";
import { cn } from "@/lib/utils";

type ScanMethod = "qr" | "nfc" | "manual";
type ScanHistoryEntry = {
  id: string;
  timestamp: string;
  token: string;
  method: ScanMethod;
  status: ReceiptData["status"];
  message?: string;
};
const SCAN_HISTORY_LIMIT = 10;

const METHOD_LABEL: Record<ScanMethod, string> = { qr: "QR", nfc: "NFC", manual: "Manual" };
const STATUS_TONE: Record<ReceiptData["status"], string> = {
  success: "bg-status-success-soft text-status-success",
  already_used: "bg-status-warning-soft text-status-warning",
  void: "bg-sera-line/60 text-sera-warm-grey",
  invalid: "bg-status-error-soft text-status-error",
};
const STATUS_LABEL: Record<ReceiptData["status"], string> = {
  success: "Redeemed",
  already_used: "Already used",
  void: "Void",
  invalid: "Invalid",
};
const formatScanTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
};
const truncateToken = (token: string) => (token.length > 14 ? `${token.slice(0, 6)}…${token.slice(-4)}` : token);

export default function BartenderPanel() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [result, setResult] = useState<RedemptionResponse | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [nfcListening, setNfcListening] = useState(false);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  const nfcCap = useMemo(() => detectNfcCapability(), []);

  const recordHistory = (entry: Omit<ScanHistoryEntry, "id">) => {
    setHistory((prev) =>
      [
        { ...entry, id: `${entry.timestamp}-${entry.token}-${Math.random().toString(36).slice(2, 7)}` },
        ...prev,
      ].slice(0, SCAN_HISTORY_LIMIT),
    );
  };

  const handleRedeem = async (code: string, method: ScanMethod) => {
    const token = normalizeScannedTicketValue(code);
    if (!token || busy || scanLocked) return;

    setBusy(true);
    setScanLocked(true);

    try {
      const redemption = await redeemTicket({
        token,
        method,
        stationLabel: "bartender_panel",
      });
      setResult(redemption);
      const status = receiptStatusFromCode(redemption.code, redemption.ok);
      const timestamp = redemption.redeemed_at ?? new Date().toISOString();
      setReceipt({
        status,
        token,
        timestamp,
        stationLabel: "bartender_panel",
        message: redemption.message,
        ticketId: redemption.ticket_id ?? null,
      });
      recordHistory({ timestamp, token, method, status, message: redemption.message });
      if (navigator.vibrate) navigator.vibrate(redemption.ok ? [80] : [40, 80, 40]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scan failed";
      setResult({ ok: false, code: "invalid", message });
      const timestamp = new Date().toISOString();
      setReceipt({
        status: "invalid",
        token,
        timestamp,
        stationLabel: "bartender_panel",
        message,
      });
      recordHistory({ timestamp, token, method, status: "invalid", message });
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
    let stopFn: (() => void) | undefined;
    stopFn = await startNfcRead(
      async (tap) => {
        const payload = tap.payload?.trim();
        if (payload) await handleRedeem(payload, "nfc");
        setNfcListening(false);
        stopFn?.();
      },
      () => {
        setNfcListening(false);
        stopFn?.();
      },
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const dismissReceipt = () => {
    setReceipt(null);
    setResult(null);
    setScanLocked(false);
  };

  return (
    <div className="min-h-screen bg-sera-paper text-sera-ink">
      <header className="border-b border-sera-line/70 bg-sera-cloud/80 backdrop-blur supports-[backdrop-filter]:bg-sera-cloud/60">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
          <div>
            <p className="sera-label text-sera-warm-grey">Bartender · Sera</p>
            <p className="font-serif text-base text-sera-ink">{fullName ?? email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-warm-grey hover:text-sera-ink">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-6 pb-24 space-y-6">
        {/* Hero / instruction */}
        <section className="space-y-2">
          <p className="sera-label text-sera-warm-grey">Tap to redeem</p>
          <h1 className="font-serif text-4xl leading-[1.05] text-sera-ink">
            Hold a guest's pass<br />to the camera.
          </h1>
          <p className="text-sm text-sera-warm-grey">
            QR is fastest. Manual entry and NFC tap are available below.
          </p>
        </section>

        {/* Scanner card */}
        <section className="overflow-hidden rounded-[28px] border border-sera-line bg-sera-cloud shadow-soft">
          <div className="flex items-center justify-between border-b border-sera-line/70 px-5 py-3">
            <div className="flex items-center gap-2 text-sera-ink">
              <ScanLine className="h-4 w-4" />
              <p className="sera-label">Live scanner</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]",
                scanLocked || busy
                  ? "bg-sera-line/60 text-sera-warm-grey"
                  : "bg-status-success-soft text-status-success",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", scanLocked || busy ? "bg-sera-warm-grey" : "bg-status-success animate-pulse")} />
              {scanLocked || busy ? "Paused" : "Listening"}
            </span>
          </div>
          <div className="bg-sera-ink/95 p-4">
            <div className="overflow-hidden rounded-2xl">
              <QrScanner onDetected={(value) => void handleRedeem(value, "qr")} paused={scanLocked || busy} />
            </div>
          </div>
        </section>

        {/* Manual entry */}
        <section className="rounded-[24px] border border-sera-line bg-sera-cloud p-5">
          <p className="sera-label text-sera-warm-grey">Manual entry</p>
          <form onSubmit={onSubmit} className="mt-3 space-y-3">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste ticket token"
              className="h-12 rounded-xl bg-sera-ivory font-mono text-sm tracking-tight"
            />
            <Button type="submit" disabled={busy || !manualCode.trim()} className="w-full rounded-full" variant="sera">
              <Ticket className="h-4 w-4 mr-2" />
              Validate code
            </Button>
          </form>
        </section>

        {/* NFC */}
        {nfcCap.supported ? (
          <Button
            type="button"
            onClick={() => void beginNfcRead()}
            disabled={busy || nfcListening}
            className="w-full rounded-full"
            variant="sera-outline"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            {nfcListening ? "Listening for NFC…" : "Read NFC tag"}
          </Button>
        ) : (
          <p className="text-center text-xs text-sera-warm-grey">
            NFC is unsupported on this browser. Continue with QR or manual entry.
          </p>
        )}

        {/* Idle hint when no receipt */}
        {!receipt && (
          <section className="rounded-[24px] border border-dashed border-sera-line bg-transparent p-6 text-center">
            <p className="font-serif text-xl text-sera-ink">Awaiting next guest</p>
            <p className="mt-1 text-sm text-sera-warm-grey">A receipt will appear here after each scan.</p>
          </section>
        )}

        <section className="rounded-[24px] border border-sera-line bg-sera-cloud p-5">
          <div className="flex items-center justify-between">
            <p className="sera-label text-sera-warm-grey">Recent scans</p>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[11px] uppercase tracking-[0.18em] text-sera-warm-grey hover:text-sera-ink"
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="mt-3 text-sm text-sera-warm-grey">No scans yet this session.</p>
          ) : (
            <ul className="mt-3 divide-y divide-sera-line/70">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]", STATUS_TONE[entry.status])}>
                        {STATUS_LABEL[entry.status]}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.16em] text-sera-warm-grey">
                        {METHOD_LABEL[entry.method]}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-sera-ink">{truncateToken(entry.token)}</p>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-sera-warm-grey">
                    {formatScanTime(entry.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Receipt overlay */}
      {receipt && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-sera-ink/40 px-4 pb-6 sm:items-center sm:pb-0">
          <div className="w-full max-w-md">
            <RedemptionReceipt data={receipt} onDismiss={dismissReceipt} />
            <button
              type="button"
              onClick={dismissReceipt}
              className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-sera-ivory/90 px-4 py-2 text-xs text-sera-ink shadow-soft hover:bg-sera-ivory"
            >
              <RefreshCcw className="h-3 w-3" /> Scan next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
