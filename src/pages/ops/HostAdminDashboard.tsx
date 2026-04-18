// @ts-nocheck
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HostAdminDashboard() {
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ops-host-dashboard"],
    queryFn: async () => {
      const { data: authData, error: userError } = await (supabase as any).auth.getUser();
      if (userError || !authData.user) throw new Error("Not authenticated");

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id,title,venue,starts_at,status")
        .eq("organizer_id", authData.user.id)
        .order("starts_at", { ascending: true })
        .limit(8);

      if (eventsError) throw eventsError;

      const eventIds = (events ?? []).map((e) => e.id);
      if (eventIds.length === 0) {
        return { events: [], guestRows: [], tickets: [], redemptions: [] };
      }

      const [{ data: guests }, { data: tickets }, { data: redemptions }] = await Promise.all([
        (supabase as any).from("guests").select("id,event_id,full_name,email,rsvp_status").in("event_id", eventIds),
        (supabase as any).from("drink_tickets").select("id,event_id,status,guest_id").in("event_id", eventIds),
        supabase
          .from("ticket_redemptions")
          .select("id,event_id,created_at,station_label,guest_id")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      return {
        events: events ?? [],
        guestRows: guests ?? [],
        tickets: tickets ?? [],
        redemptions: redemptions ?? [],
      };
    },
  });

  const filteredGuests = useMemo(() => {
    const guests = data?.guestRows ?? [];
    if (!query.trim()) return guests;
    const q = query.toLowerCase();
    return guests.filter((guest) => guest.full_name.toLowerCase().includes(q) || (guest.email ?? "").toLowerCase().includes(q));
  }, [data?.guestRows, query]);

  const metrics = useMemo(() => {
    const tickets = data?.tickets ?? [];
    const redeemed = tickets.filter((t) => t.status === "redeemed").length;
    const active = tickets.filter((t) => t.status === "active").length;
    const voided = tickets.filter((t) => t.status === "void").length;

    return {
      events: data?.events.length ?? 0,
      guests: data?.guestRows.length ?? 0,
      redeemed,
      active,
      voided,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <header className="rounded-2xl border border-sera-sand/40 bg-sera-ivory p-6 md:p-8">
          <p className="sera-label text-sera-stone mb-3">Host Admin</p>
          <h1 className="font-serif text-3xl md:text-4xl text-sera-navy">Event operations dashboard</h1>
          <p className="sera-body text-sera-warm-grey mt-3 max-w-2xl">
            Guest management, drink ticket utilization, and live redemption signals for premium service flow.
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[{ label: "Events", value: metrics.events }, { label: "Guests", value: metrics.guests }, { label: "Active", value: metrics.active }, { label: "Redeemed", value: metrics.redeemed }, { label: "Void", value: metrics.voided }].map((card) => (
            <article key={card.label} className="border border-sera-sand/40 bg-sera-ivory p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-sera-stone">{card.label}</p>
              <p className="font-serif text-2xl text-sera-navy mt-2">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <article className="border border-sera-sand/50 bg-sera-ivory p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-sera-navy">Guest list</h2>
              <div className="flex gap-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guests" className="h-9 md:w-64" />
                <Button size="sm" variant="sera-outline" onClick={() => void refetch()}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="overflow-auto border border-sera-sand/40">
              <table className="w-full text-sm">
                <thead className="bg-sera-ivory/60">
                  <tr className="text-left text-xs uppercase tracking-wider text-sera-stone">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">RSVP</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="px-4 py-4 text-sera-warm-grey" colSpan={3}>Loading guest list...</td></tr>
                  ) : filteredGuests.length === 0 ? (
                    <tr><td className="px-4 py-4 text-sera-warm-grey" colSpan={3}>No matching guests.</td></tr>
                  ) : (
                    filteredGuests.map((guest) => (
                      <tr key={guest.id} className="border-t border-sera-sand/20">
                        <td className="px-4 py-3 text-sera-navy">{guest.full_name}</td>
                        <td className="px-4 py-3 text-sera-warm-grey">{guest.email ?? "—"}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{guest.rsvp_status}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="border border-sera-sand/50 bg-sera-ivory p-5">
              <h2 className="font-serif text-xl text-sera-navy mb-4">Recent redemption activity</h2>
              <div className="space-y-3">
                {(data?.redemptions ?? []).map((row) => (
                  <div key={row.id} className="rounded-lg border border-sera-sand/30 p-3 bg-sera-ivory/70">
                    <p className="text-sm text-sera-navy">Station: {row.station_label ?? "Bar"}</p>
                    <p className="text-xs text-sera-warm-grey mt-1">{new Date(row.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {!isLoading && (data?.redemptions ?? []).length === 0 && <p className="text-sm text-sera-warm-grey">No redemptions yet.</p>}
              </div>
            </article>

            <article className="border border-sera-sand/50 bg-sera-ivory p-5">
              <h2 className="font-serif text-xl text-sera-navy mb-4">Events</h2>
              <div className="space-y-2">
                {(data?.events ?? []).map((event) => (
                  <div key={event.id} className="border border-sera-sand/30 p-3">
                    <p className="text-sm text-sera-navy">{event.title}</p>
                    <p className="text-xs text-sera-warm-grey mt-1">{event.venue ?? "Venue TBA"} · {new Date(event.starts_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
