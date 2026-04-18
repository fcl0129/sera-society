import { supabase } from "@/integrations/supabase/client";

export type RedemptionResponse = {
  ok: boolean;
  code: "redeemed" | "already_redeemed" | "invalid" | "blocked" | "forbidden" | "unauthorized" | string;
  message?: string;
  ticket_id?: string;
  event_id?: string;
  ticket_type?: string;
  redeemed_count?: number;
  redemption_limit?: number;
  status?: string;
};

export async function redeemTicket(input: {
  code: string;
  method: "qr" | "nfc";
  redemptionPointId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.functions.invoke("redeem-ticket", {
    body: {
      code: input.code,
      method: input.method,
      redemption_point_id: input.redemptionPointId,
      metadata: input.metadata ?? {},
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as RedemptionResponse;
}
