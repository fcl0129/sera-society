import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type TokenResponse = { token: string; expires_at: string; ttl_seconds: number };
const tokenStorageKey = (eventId: string) => `drink_redeem_token:${eventId}`;

export default function DrinkRedeem() {
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stationUrl = useMemo(() => {
    const base = typeof window === "undefined" ? "https://sera-society.com" : window.location.origin;
    return `${base}/redeem?event_id=${eventId}&station_id=BAR_01`;
  }, [eventId]);

  const generateToken = async () => {
    if (!eventId) return;
    setError(null);
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("You need to sign in first.");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Unable to read current user.");

      const { data, error } = await supabase.functions.invoke<TokenResponse>("generate-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { user_id: userData.user.id, event_id: eventId, ttl_seconds: 45 },
      });
      if (error || !data) throw new Error(error?.message ?? "Could not generate token.");
      setToken(data);
      sessionStorage.setItem(tokenStorageKey(eventId), JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate token.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader title="Redeem a drink" description="Generate a short-lived token, then tap your NFC sticker to confirm service." />
      </SeraContainer>
      <SeraSection>
        <SeraContainer className="space-y-8">
          <section className="space-y-3 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            <h2 className="font-display text-3xl text-[#f1e6d7]">Step 1 · Create token</h2>
            <Button variant="sera" disabled={isGenerating} onClick={() => void generateToken()}>
              {isGenerating ? "Generating..." : "Generate token"}
            </Button>
            {token ? <p>Token ready. Expires at {new Date(token.expires_at).toLocaleTimeString()}.</p> : null}
            {error ? <p className="text-[#f2c3b9]">{error}</p> : null}
          </section>

          <section className="space-y-2 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            <h2 className="font-display text-3xl text-[#f1e6d7]">Step 2 · Tap NFC sticker</h2>
            <p className="text-sm">Fallback URL (works by normal browser open):</p>
            <p className="break-all border border-[#e3d4be]/25 bg-[#0f1725]/35 p-3 font-mono text-xs">{stationUrl}</p>
          </section>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
