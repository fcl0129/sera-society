import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type TokenResponse = {
  token: string;
  expires_at: string;
  ttl_seconds: number;
};

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("You must be logged in to redeem drinks.");
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Unable to read current user.");

      const { data, error } = await supabase.functions.invoke<TokenResponse>("generate-token", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          user_id: userData.user.id,
          event_id: eventId,
          ttl_seconds: 45,
        },
      });

      if (error || !data) throw new Error(error?.message ?? "Failed to generate token.");

      setToken(data);
      sessionStorage.setItem(tokenStorageKey(eventId), JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate token.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-sera-midnight">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-28 pb-16 space-y-6">
        <p className="sera-label text-sera-stone">Event Drink Wallet</p>
        <h1 className="sera-heading text-sera-ivory text-4xl">Redeem Drink</h1>

        <Card className="border-sera-sand/30 bg-sera-ivory/5">
          <CardHeader>
            <CardTitle className="text-sera-ivory">Step 1 — Generate secure token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sera-sand">
            <Button variant="sera" disabled={isGenerating} onClick={() => void generateToken()}>
              {isGenerating ? "Generating..." : "Redeem Drink"}
            </Button>
            {token && (
              <p className="text-sm text-green-300">
                Token ready (expires {new Date(token.expires_at).toLocaleTimeString()}). Tap NFC sticker now.
              </p>
            )}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </CardContent>
        </Card>

        <Card className="border-sera-sand/30 bg-sera-ivory/5">
          <CardHeader>
            <CardTitle className="text-sera-ivory">Step 2 — Tap NFC sticker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sera-sand">
            <p className="text-sm">NFC tag URL (fallback works without NFC as normal browser navigation):</p>
            <p className="font-mono text-xs break-all bg-sera-ivory/10 p-3 rounded">{stationUrl}</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
