import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { redeemTicket, normalizeScannedTicketValue, type RedemptionResponse } from "@/lib/redemption";
import { LogOut, RefreshCcw, Ticket, ScanLine } from "lucide-react";
import QrScanner from "@/components/ops/QrScanner";
import { RedemptionReceipt, type ReceiptData, receiptStatusFromCode } from "@/components/ops/RedemptionReceipt";

type ScanMethod = "qr" | "manual";
type ScanHistoryEntry = {
  id: string;
  timestamp: string;
  token: string;
  method: ScanMethod;
  status: ReceiptData["status"];
  message?: string;
};
const SCAN_HISTORY_LIMIT = 10;

const METHOD_LABEL: Record<ScanMethod, string> = { qr: "Scan Pass", manual: "Guest Lookup" };

const STATUS_STYLE: Record<ReceiptData["status"], { bg: string; color: string }> = {
  success:      { bg: "rgba(61,74,53,0.25)",   color: "#3D4A35" },
  already_used: { bg: "rgba(169,132,92,0.18)", color: "#A9845C" },
  void:         { bg: "rgba(244,235,221,0.08)", color: "#A8B4C3" },
  invalid:      { bg: "rgba(90,18,24,0.25)",   color: "#A35D5D" },
  unauthorized: { bg: "rgba(90,18,24,0.25)",   color: "#A35D5D" },
};

const STATUS_LABEL: Record<ReceiptData["status"], string> = {
  success: "Redeemed",
  already_used: "Already used",
  void: "Void",
  invalid: "Invalid",
  unauthorized: "Unauthorized",
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
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const dismissReceipt = () => {
    setReceipt(null);
    setResult(null);
    setScanLocked(false);
  };

  const isListening = !scanLocked && !busy;

  return (
    <div style={{ minHeight: "100vh", background: "var(--app-bg)", color: "var(--app-text)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--app-line)",
        background: "rgba(7,20,38,0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sera-brass)" }}>
              Bar Mode · Sera
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1rem", color: "var(--app-text)" }}>
              {fullName ?? email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: "1px solid var(--app-line)",
              width: 36,
              height: 36,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--app-text-muted)",
              cursor: "pointer",
            }}
          >
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px 96px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero */}
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sera-brass)" }}>
            Bar Mode
          </p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "2.4rem", letterSpacing: "-0.035em", color: "var(--app-text)", lineHeight: 1.02 }}>
            Pour the next.
          </h1>
          <p style={{ margin: "8px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.92rem", lineHeight: 1.55, color: "var(--app-text-muted)" }}>
            Scan a guest pass or enter a token manually. The system handles duplicate redemptions quietly.
          </p>
        </section>

        {/* Scanner card */}
        <section style={{ border: "1px solid var(--app-card-border)", overflow: "hidden" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--app-line)",
            padding: "12px 20px",
            background: "rgba(13,27,46,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--app-text)" }}>
              <ScanLine style={{ width: 16, height: 16 }} />
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                Scan Pass
              </p>
            </div>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              border: isListening ? "1px solid rgba(61,74,53,0.5)" : "1px solid var(--app-line)",
              color: isListening ? "#3D4A35" : "var(--app-text-muted)",
              padding: "3px 10px",
              borderRadius: 999,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isListening ? "#3D4A35" : "var(--app-text-muted)",
              }} />
              {isListening ? "Listening" : "Paused"}
            </span>
          </div>
          <div style={{ background: "rgba(7,20,38,0.95)", padding: 16 }}>
            <div style={{ overflow: "hidden" }}>
              <QrScanner onDetected={(value) => void handleRedeem(value, "qr")} paused={scanLocked || busy} />
            </div>
          </div>
        </section>

        {/* Manual entry */}
        <section style={{
          border: "1px solid var(--app-line-brass)",
          background: "rgba(169,132,92,0.04)",
          padding: 22,
        }}>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sera-brass)" }}>
            Manual entry
          </p>
          <form onSubmit={onSubmit} style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste guest pass code · SERA-XXXX-XXXX"
              style={{
                height: 48,
                background: "rgba(7,20,38,0.7)",
                border: "1px solid var(--app-card-border)",
                borderRadius: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "0.88rem",
                color: "var(--app-text)",
                letterSpacing: "0.04em",
              }}
            />
            <button
              type="submit"
              disabled={busy || !manualCode.trim()}
              style={{
                width: "100%",
                padding: "14px 0",
                background: busy || !manualCode.trim() ? "rgba(244,235,221,0.08)" : "var(--sera-oxblood)",
                border: "none",
                color: busy || !manualCode.trim() ? "var(--app-text-muted)" : "var(--sera-cream)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: busy || !manualCode.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ticket style={{ width: 14, height: 14 }} />
              Pour
            </button>
          </form>
        </section>

        {/* Idle hint when no receipt */}
        {!receipt && (
          <section style={{
            border: "1px dashed var(--app-card-border)",
            background: "transparent",
            padding: 24,
            textAlign: "center",
          }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.25rem", color: "var(--app-text)" }}>
              Awaiting next guest
            </p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--app-text-muted)" }}>
              A receipt will appear here after each redemption.
            </p>
          </section>
        )}

        {/* Bar Ledger */}
        <section style={{
          border: "1px solid var(--app-card-border)",
          background: "rgba(13,27,46,0.5)",
          padding: 22,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sera-brass)" }}>
              Bar Ledger
            </p>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                style={{
                  background: "transparent",
                  border: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--app-text-muted)",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p style={{ margin: "12px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--app-text-muted)" }}>
              No redemptions yet this session.
            </p>
          ) : (
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
              {history.map((entry, i) => {
                const s = STATUS_STYLE[entry.status];
                return (
                  <li
                    key={entry.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 0",
                      borderTop: i === 0 ? "none" : "1px solid var(--app-line)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          background: s.bg,
                          color: s.color,
                        }}>
                          {STATUS_LABEL[entry.status]}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--app-text-muted)" }}>
                          {METHOD_LABEL[entry.method]}
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--app-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {truncateToken(entry.token)}
                      </p>
                    </div>
                    <span style={{ flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.66rem", fontVariantNumeric: "tabular-nums", color: "var(--app-text-muted)" }}>
                      {formatScanTime(entry.timestamp)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Receipt overlay */}
      {receipt && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "rgba(7,20,38,0.72)",
          padding: "0 16px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <RedemptionReceipt data={receipt} onDismiss={dismissReceipt} />
            <button
              type="button"
              onClick={dismissReceipt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "12px auto 0",
                padding: "8px 16px",
                background: "rgba(244,235,221,0.12)",
                border: "1px solid var(--app-card-border)",
                borderRadius: 999,
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--app-text)",
                cursor: "pointer",
              }}
            >
              <RefreshCcw style={{ width: 12, height: 12 }} />
              Ready for next guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
