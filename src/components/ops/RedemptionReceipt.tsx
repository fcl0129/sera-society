import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-[28px] border bg-sera-ivory text-sera-ink shadow-elevated",
        "animate-in fade-in zoom-in-95 duration-300",
        meta.tone === "success" && "border-status-success/30",
        meta.tone === "warn" && "border-status-warning/40",
        meta.tone === "error" && "border-destructive/30",
      )}
    >
      {/* Top tape: subtle perforated edge */}
      <div className="relative h-3 w-full bg-sera-ivory">
        <div
          className="absolute inset-x-0 bottom-0 h-3"
          style={{
            backgroundImage:
              "radial-gradient(circle at 6px 0, hsl(var(--background)) 4px, transparent 5px)",
            backgroundSize: "12px 6px",
            backgroundRepeat: "repeat-x",
          }}
          aria-hidden
        />
      </div>

      <div className="px-6 pb-6 pt-2 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="sera-label text-sera-warm-grey">Sera Society · Receipt</p>
            <h2 className="font-serif text-3xl leading-tight text-sera-ink">{meta.title}</h2>
            <p className="text-sm text-sera-warm-grey">{data.message ?? meta.subtitle}</p>
          </div>
          <StatusIcon tone={meta.tone} />
        </div>

        <hr className="my-5 border-dashed border-sera-line" />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Row label="Status">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]",
                meta.tone === "success" && "bg-status-success-soft text-status-success",
                meta.tone === "warn" && "bg-status-warning-soft text-status-warning",
                meta.tone === "error" && "bg-destructive/10 text-destructive",
              )}
            >
              {data.status.replace("_", " ")}
            </span>
          </Row>
          <Row label="Time">
            <span className="font-mono tabular-nums">{fmtTime.format(date)}</span>
          </Row>
          <Row label="Date">
            <span className="font-mono tabular-nums">{fmtDate.format(date)}</span>
          </Row>
          {data.stationLabel && (
            <Row label="Station">
              <span className="font-mono uppercase tracking-wider">{data.stationLabel}</span>
            </Row>
          )}
        </dl>

        <div className="mt-5 rounded-2xl border border-sera-line bg-sera-cloud px-4 py-3">
          <p className="sera-label text-sera-warm-grey">Ticket token</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <code className="font-mono text-xs text-sera-ink break-all">{tokenShort}</code>
            <button
              type="button"
              onClick={copyToken}
              className="inline-flex items-center gap-1 rounded-full border border-sera-line bg-sera-ivory px-2.5 py-1 text-[11px] text-sera-ink transition-colors hover:border-sera-navy/40"
            >
              {copied ? <Check className="h-3 w-3 text-status-success" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-5 w-full rounded-full border border-sera-ink/15 bg-sera-ink py-3 text-sm font-medium text-sera-ivory transition-colors hover:bg-sera-ink/90"
          >
            Continue
          </button>
        )}
      </div>

      {/* Bottom tape */}
      <div className="relative h-3 w-full bg-sera-ivory">
        <div
          className="absolute inset-x-0 top-0 h-3"
          style={{
            backgroundImage:
              "radial-gradient(circle at 6px 6px, hsl(var(--background)) 4px, transparent 5px)",
            backgroundSize: "12px 6px",
            backgroundRepeat: "repeat-x",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="sera-label text-sera-warm-grey">{label}</dt>
      <dd className="mt-0.5 text-sera-ink">{children}</dd>
    </div>
  );
}

function StatusIcon({ tone }: { tone: "success" | "warn" | "error" }) {
  const base = "h-10 w-10";
  if (tone === "success") return <CheckCircle2 className={cn(base, "text-status-success")} strokeWidth={1.5} />;
  if (tone === "warn") return <AlertTriangle className={cn(base, "text-status-warning")} strokeWidth={1.5} />;
  return <XCircle className={cn(base, "text-destructive")} strokeWidth={1.5} />;
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