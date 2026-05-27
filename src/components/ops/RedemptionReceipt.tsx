import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Copy, Check } from "lucide-react";

export type ReceiptStatus = "success" | "already_used" | "invalid" | "void" | "unauthorized";

export type ReceiptData = {
  status: ReceiptStatus;
  token: string;
  /** ISO timestamp of redemption (or attempt). */
  timestamp: string;
  stationLabel?: string | null;
  message?: string | null;
  ticketId?: string | null;
};

const statusCopy: Record<ReceiptStatus, { title: string; subtitle: string; tone: "success" | "warn" | "error" }> = {
  success: {
    title: "Redeemed",
    subtitle: "Drink approved. Enjoy the evening.",
    tone: "success",
  },
  already_used: {
    title: "Already used",
    subtitle: "This ticket has been redeemed previously.",
    tone: "warn",
  },
  invalid: {
    title: "Invalid ticket",
    subtitle: "We couldn't verify this code. Try another.",
    tone: "error",
  },
  void: {
    title: "Voided",
    subtitle: "This ticket was cancelled by the organizer.",
    tone: "error",
  },
  unauthorized: {
    title: "Sign in required",
    subtitle: "Staff must be signed in to redeem.",
    tone: "error",
  },
};

const TONE_BORDER: Record<"success" | "warn" | "error", string> = {
  success: "rgba(61,74,53,0.5)",
  warn:    "rgba(169,132,92,0.5)",
  error:   "rgba(90,18,24,0.5)",
};
const TONE_BG: Record<"success" | "warn" | "error", string> = {
  success: "rgba(61,74,53,0.1)",
  warn:    "rgba(169,132,92,0.08)",
  error:   "rgba(90,18,24,0.1)",
};
const TONE_COLOR: Record<"success" | "warn" | "error", string> = {
  success: "#3D4A35",
  warn:    "#A9845C",
  error:   "#A35D5D",
};

const fmtTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});
const fmtDate = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function RedemptionReceipt({ data, onDismiss }: { data: ReceiptData; onDismiss?: () => void }) {
  const meta = statusCopy[data.status];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [data.token, data.timestamp]);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(data.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no-op */
    }
  };

  const date = new Date(data.timestamp);
  const tokenShort = data.token.length > 18 ? `${data.token.slice(0, 8)}…${data.token.slice(-6)}` : data.token;
  const borderColor = TONE_BORDER[meta.tone];
  const bgColor = TONE_BG[meta.tone];
  const accentColor = TONE_COLOR[meta.tone];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        border: `1px solid ${borderColor}`,
        background: "rgba(13,27,46,0.96)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        padding: "24px 28px",
        animation: "fadeInUp 0.28s ease-out both",
      }}
    >
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sera-brass)" }}>
            Sera Society · Receipt
          </p>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "2rem", letterSpacing: "-0.025em", color: "var(--app-text)", lineHeight: 1.05 }}>
            {meta.title}
          </h2>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--app-text-muted)" }}>
            {data.message ?? meta.subtitle}
          </p>
        </div>
        <StatusIcon tone={meta.tone} />
      </div>

      {/* Divider */}
      <div style={{ margin: "20px 0", height: 1, background: "var(--app-line)" }} />

      {/* Meta grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        <MetaRow label="Status" accentColor={accentColor}>
          <span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 999,
            background: bgColor,
            border: `1px solid ${borderColor}`,
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: accentColor,
          }}>
            {data.status.replace("_", " ")}
          </span>
        </MetaRow>
        <MetaRow label="Time" accentColor={accentColor}>
          <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "0.86rem", color: "var(--app-text)" }}>
            {fmtTime.format(date)}
          </span>
        </MetaRow>
        <MetaRow label="Date" accentColor={accentColor}>
          <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "0.86rem", color: "var(--app-text)" }}>
            {fmtDate.format(date)}
          </span>
        </MetaRow>
        {data.stationLabel && (
          <MetaRow label="Station" accentColor={accentColor}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--app-text)" }}>
              {data.stationLabel}
            </span>
          </MetaRow>
        )}
      </div>

      {/* Token */}
      <div style={{
        marginTop: 20,
        border: "1px solid var(--app-card-border)",
        background: "rgba(7,20,38,0.7)",
        padding: "14px 16px",
      }}>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sera-brass)" }}>
          Ticket token
        </p>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--app-text)", wordBreak: "break-all", letterSpacing: "0.06em" }}>
            {tokenShort}
          </code>
          <button
            type="button"
            onClick={copyToken}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--app-card-border)",
              background: "transparent",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-text-muted)",
              cursor: "pointer",
            }}
          >
            {copied ? <Check style={{ width: 11, height: 11, color: "#3D4A35" }} /> : <Copy style={{ width: 11, height: 11 }} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px 0",
            background: "var(--sera-oxblood)",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--sera-cream)",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      )}
    </div>
  );
}

function MetaRow({ label, accentColor, children }: { label: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div>
      <dt style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: accentColor }}>
        {label}
      </dt>
      <dd style={{ margin: "4px 0 0" }}>{children}</dd>
    </div>
  );
}

function StatusIcon({ tone }: { tone: "success" | "warn" | "error" }) {
  const style = { width: 36, height: 36, color: TONE_COLOR[tone] };
  if (tone === "success") return <CheckCircle2 style={style} strokeWidth={1.5} />;
  if (tone === "warn") return <AlertTriangle style={style} strokeWidth={1.5} />;
  return <XCircle style={style} strokeWidth={1.5} />;
}

/** Helper to map redemption response code → ReceiptStatus. */
export function receiptStatusFromCode(code: string | undefined, ok: boolean): ReceiptStatus {
  if (ok) return "success";
  switch (code) {
    case "already_redeemed":
      return "already_used";
    case "void":
      return "void";
    case "unauthorized":
    case "forbidden":
      return "unauthorized";
    default:
      return "invalid";
  }
}
