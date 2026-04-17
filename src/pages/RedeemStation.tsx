import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type RedemptionResponse = {
  status: "success" | "rejected";
  remaining_tickets: number | null;
};

type StoredToken = {
  token: string;
  expires_at: string;
};

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
      if (!parsed.token) return null;
      if (new Date(parsed.expires_at).getTime() <= Date.now()) return null;
      return parsed.token;
    } catch {
      return null;
    }
  }, [eventId]);

  const redeem = async (token: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke<RedemptionResponse>("redeem", {
        body: {
          token,
          station_id: stationId,
        },
      });

      if (error || !data) throw new Error(error?.message ?? "Redemption failed.");

      setStatus(data.status);
      if (data.status === "success") {
        setMessage(`Drink approved. ${data.remaining_tickets ?? 0} tickets remaining.`);
      } else {
        setMessage("Redemption rejected. Request a fresh token and try again.");
      }

      if (eventId) {
        sessionStorage.removeItem(keyForEvent(eventId));
      }
    } catch (err) {
      setStatus("rejected");
      setMessage(err instanceof Error ? err.message : "Redemption failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndRedeem = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      if (!session?.access_token || !userData.user || !eventId) {
        throw new Error("Login required before confirming redemption.");
      }

      const { data: tokenData, error: tokenError } = await supabase.functions.invoke<{ token: string }>("generate-token", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          user_id: userData.user.id,
          event_id: eventId,
          ttl_seconds: 45,
        },
      });

      if (tokenError || !tokenData?.token) {
        throw new Error(tokenError?.message ?? "Could not generate token.");
      }

      await redeem(tokenData.token);
    } catch (err) {
      setStatus("rejected");
      setMessage(err instanceof Error ? err.message : "Could not redeem drink.");
    }
  };

  useEffect(() => {
    if (storedToken) {
      void redeem(storedToken);
    }
  }, [storedToken]);

  return (
    <div className="min-h-screen bg-sera-midnight">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-28 pb-16 space-y-6">
        <p className="sera-label text-sera-stone">Station {stationId}</p>
        <h1 className="sera-heading text-sera-ivory text-4xl">Drink Redemption</h1>

        <Card className={`border ${status === "success" ? "border-green-500/40 bg-green-500/10" : status === "rejected" ? "border-red-500/40 bg-red-500/10" : "border-sera-sand/30 bg-sera-ivory/5"}`}>
          <CardHeader>
            <CardTitle className="text-sera-ivory">{storedToken ? "Auto redeeming..." : "Confirm redemption"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sera-sand">
            {!storedToken && (
              <Button variant="sera" disabled={isLoading} onClick={() => void generateAndRedeem()}>
                {isLoading ? "Processing..." : "Confirm redemption"}
              </Button>
            )}
            {message && <p className="text-sm">{message}</p>}
            <p className="text-xs text-sera-stone">
              iOS Web NFC fallback: this page works via normal URL open from NFC sticker.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
