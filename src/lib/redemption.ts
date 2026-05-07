import { supabase } from "@/integrations/supabase/client";

/**
 * Normalize a raw scanner value (QR/NFC/manual) into a ticket token string.
 * Accepts:
 *  - raw token text
 *  - URLs containing /pass/:token
 *  - URLs with ?token=... or ?ticket=...
 */
export function normalizeScannedTicketValue(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  // Try URL parse
  try {
    const url = new URL(trimmed);
    const qsToken = url.searchParams.get("token") ?? url.searchParams.get("ticket");
    if (qsToken) return qsToken.trim();
    const segments = url.pathname.split("/").filter(Boolean);
    const passIdx = segments.findIndex((s) => s.toLowerCase() === "pass");
    if (passIdx >= 0 && segments[passIdx + 1]) {
      return decodeURIComponent(segments[passIdx + 1]).trim();
    }
    // Fallback: last path segment
    if (segments.length > 0) {
      return decodeURIComponent(segments[segments.length - 1]).trim();
    }
  } catch {
    // Not a URL — return raw
  }

  return trimmed;
}

export type RedemptionResponse = {
  ok: boolean;
  code: "redeemed" | "already_redeemed" | "invalid" | "void" | "forbidden" | "unauthorized" | "invalid_method" | "rpc_error" | string;
  message?: string;
  ticket_id?: string;
  event_id?: string;
  redeemed_at?: string;
};

export async function redeemTicket(input: {
  /** Raw drink_tickets.token (from QR scan, NFC tap, or manual entry). */
  token: string;
  method: "qr" | "nfc" | "manual";
  stationLabel?: string;
}) {
  const { data, error } = await supabase.functions.invoke("redeem-ticket", {
    body: {
      token: input.token,
      method: input.method,
      station_label: input.stationLabel,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as RedemptionResponse;
}
