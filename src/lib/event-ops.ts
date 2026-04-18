import { supabase } from "@/integrations/supabase/client";

export type RedemptionStatus = "redeemed" | "already_redeemed" | "invalid";

export async function redeemTicketByCode(input: { eventId: string; ticketCode: string; stationLabel?: string }) {
  const { data, error } = await (supabase as any).rpc("redeem_drink_ticket_by_code", {
    p_event_id: input.eventId,
    p_ticket_code: input.ticketCode.trim(),
    p_station_label: input.stationLabel ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = data?.[0] as
    | { status: RedemptionStatus; message: string; ticket_id: string | null; redeemed_at: string | null }
    | undefined;

  if (!row) {
    throw new Error("No redemption response returned.");
  }

  return row;
}
