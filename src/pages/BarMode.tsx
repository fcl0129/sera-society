// @ts-nocheck
import { useEffect, useState } from "react";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/bar-mode` : undefined } });
    setNotice(error ? error.message : "Magic link sent. Open it on this bartender device.");
  };

  const loadFeed = async () => {
    if (!eventId) return;
    const { data, error } = await supabase.from("redemptions").select("id,user_id,station_id,status,reason,redeemed_at,users(full_name)").eq("event_id", eventId).order("redeemed_at", { ascending: false }).limit(20);
    if (!error && data) setFeed(data as FeedRow[]);
  };

  useEffect(() => { void loadFeed(); }, [eventId]);
  useEffect(() => {
    const channel = supabase.channel("bar-redemptions-feed").on("postgres_changes", { event: "INSERT", schema: "public", table: "redemptions" }, (payload) => {
      const inserted = payload.new as FeedRow;
      if (eventId && (payload.new as { event_id?: string }).event_id !== eventId) return;
      setFeed((current) => [inserted, ...current].slice(0, 20));
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [eventId]);

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader title="Bar mode" description="Keep service moving with a live view of redemption activity." />
      </SeraContainer>
      <SeraSection>
        <SeraContainer className="space-y-8">
          <section className="space-y-3 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            <h2 className="font-display text-3xl text-[#f1e6d7]">Bartender sign-in</h2>
            <Input placeholder="bartender@sera-society.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="sera" onClick={() => void sendMagicLink()}>Send magic link</Button>
            {notice ? <p className="text-sm">{notice}</p> : null}
          </section>

          <section className="space-y-3 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            <h2 className="font-display text-3xl text-[#f1e6d7]">Live feed</h2>
            <Input placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
            <Button variant="sera-outline" onClick={() => void loadFeed()}>Refresh</Button>
            <div className="space-y-2">
              {feed.map((row) => (
                <div key={row.id} className="flex items-center justify-between border-t border-[#e7d8c4]/20 py-3">
                  <div>
                    <p>{row.users?.full_name ?? row.user_id}</p>
                    <p className="text-xs opacity-80">{row.station_id} · {new Date(row.redeemed_at).toLocaleTimeString()}</p>
                  </div>
                  <Badge className={row.status === "success" ? "bg-green-700" : "bg-red-700"}>{row.status}</Badge>
                </div>
              ))}
            </div>
          </section>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
