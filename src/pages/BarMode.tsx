import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

type FeedRow = {
  id: string;
  user_id: string;
  station_id: string;
  status: "success" | "rejected";
  reason: string | null;
  redeemed_at: string;
  users: { full_name: string | null } | null;
};

export default function BarMode() {
  const [email, setEmail] = useState("");
  const [eventId, setEventId] = useState("");
  const [feed, setFeed] = useState<FeedRow[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const sendMagicLink = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/bar-mode` : undefined,
      },
    });

    if (error) {
      setNotice(error.message);
      return;
    }

    setNotice("Magic link sent. Open it on this bartender device.");
  };

  const loadFeed = async () => {
    if (!eventId) return;
    const { data, error } = await supabase
      .from("redemptions")
      .select("id,user_id,station_id,status,reason,redeemed_at,users(full_name)")
      .eq("event_id", eventId)
      .order("redeemed_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setFeed(data as FeedRow[]);
    }
  };

  useEffect(() => {
    void loadFeed();
  }, [eventId]);

  useEffect(() => {
    const channel = supabase
      .channel("bar-redemptions-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "redemptions",
        },
        (payload) => {
          const inserted = payload.new as FeedRow;
          if (eventId && (payload.new as { event_id?: string }).event_id !== eventId) return;

          setFeed((current) => [inserted, ...current].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId]);

  return (
    <div className="min-h-screen bg-sera-midnight">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16 space-y-6">
        <p className="sera-label text-sera-stone">Bar Mode</p>
        <h1 className="sera-heading text-sera-ivory text-4xl">Live Redemption Feed</h1>

        <Card className="border-sera-sand/30 bg-sera-ivory/5">
          <CardHeader>
            <CardTitle className="text-sera-ivory">Bartender Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="bartender@sera-society.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="sera" onClick={() => void sendMagicLink()}>Send magic link</Button>
            {notice && <p className="text-sm text-sera-sand">{notice}</p>}
          </CardContent>
        </Card>

        <Card className="border-sera-sand/30 bg-sera-ivory/5">
          <CardHeader>
            <CardTitle className="text-sera-ivory">Event Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
            <Button variant="sera-outline" onClick={() => void loadFeed()}>Refresh</Button>

            <div className="space-y-2">
              {feed.map((row) => (
                <div key={row.id} className={`rounded border p-3 flex items-center justify-between ${row.status === "success" ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"}`}>
                  <div>
                    <p className="text-sera-ivory text-sm">{row.users?.full_name ?? row.user_id}</p>
                    <p className="text-xs text-sera-sand">{row.station_id} • {new Date(row.redeemed_at).toLocaleTimeString()}</p>
                  </div>
                  <Badge className={row.status === "success" ? "bg-green-600" : "bg-red-600"}>{row.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
