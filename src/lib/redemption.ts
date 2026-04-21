import { supabase } from "@/integrations/supabase/client";

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
