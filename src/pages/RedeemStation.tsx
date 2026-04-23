import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type RedemptionResponse = { status: "success" | "rejected"; remaining_tickets: number | null };
type StoredToken = { token: string; expires_at: string };
const keyForEvent = (eventId: string) => `drink_redeem_token:${eventId}`;

export default function RedeemStation() {
  const [params] = useSearchParams();
  const stationId = params.get("station_id") ?? "BAR_01";
  const eventId = params.get("event_id") ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "rejected" | null>(null);

  const storedToken = useMemo(() => {
    if (!eventId) return null;
    const raw = sessionStorage.getItem(keyForEvent(eventId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredToken;
      return parsed.token && new Date(parsed.expires_at).getTime() > Date.now() ? parsed.token : null;
    } catch {
      return null;
    }
  }, [eventId]);

  const redeem = async (token: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke<RedemptionResponse>("redeem", { body: { token, station_id: stationId } });
      if (error || !data) throw new Error(error?.message ?? "Redemption failed.");
      setStatus(data.status);
      setMessage(data.status === "success" ? `Approved. ${data.remaining_tickets ?? 0} tickets remaining.` : "Redemption rejected.");
      if (eventId) sessionStorage.removeItem(keyForEvent(eventId));
    } catch (err) {
      setStatus("rejected");
      setMessage(err instanceof Error ? err.message : "Could not redeem drink.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndRedeem = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      if (!session?.access_token || !userData.user || !eventId) throw new Error("Please sign in first.");
      const { data: tokenData, error } = await supabase.functions.invoke<{ token: string }>("generate-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { user_id: userData.user.id, event_id: eventId, ttl_seconds: 45 },
      });
      if (error || !tokenData?.token) throw new Error(error?.message ?? "Could not generate token.");
      await redeem(tokenData.token);
    } catch (err) {
      setStatus("rejected");
      setMessage(err instanceof Error ? err.message : "Could not redeem drink.");
    }
  };

  useEffect(() => {
    if (storedToken) void redeem(storedToken);
  }, [storedToken]);

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader title="Station redemption" description={`Station ${stationId} · confirm each drink quietly and quickly.`} />
      </SeraContainer>
      <SeraSection>
        <SeraContainer>
          <div className={`space-y-4 border-t pt-6 text-[#d7cab8] ${status === "success" ? "border-green-400/40" : status === "rejected" ? "border-red-400/45" : "border-[#e7d8c4]/20"}`}>
            {!storedToken ? <Button variant="sera" disabled={isLoading} onClick={() => void generateAndRedeem()}>{isLoading ? "Processing..." : "Confirm redemption"}</Button> : null}
            {message ? <p>{message}</p> : <p className="text-sm">Ready to confirm the next guest.</p>}
          </div>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
