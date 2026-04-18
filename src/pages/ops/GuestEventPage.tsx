import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function GuestEventPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["guest-event-experience"],
    queryFn: async () => {
      const { data: authData, error: authError } = await (supabase as any).auth.getUser();
      if (authError || !authData.user) throw new Error("Please sign in");

      const { data: memberships, error: membershipError } = await supabase
        .from("guest_event_memberships")
        .select("event_id,guest_id,events(id,title,venue,starts_at),guests(id,full_name)")
        .eq("guest_user_id", authData.user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!memberships) {
        return { event: null, guest: null, tickets: [] };
      }

      const { data: tickets } = await supabase
        .from("drink_tickets")
        .select("id,status,created_at,redeemed_at,ticket_code")
        .eq("event_id", memberships.event_id)
        .eq("guest_id", memberships.guest_id)
        .order("created_at", { ascending: true });

      return {
        event: memberships.events,
        guest: memberships.guests,
        tickets: tickets ?? [],
      };
    },
  });

  const ticketStats = useMemo(() => {
    const tickets = data?.tickets ?? [];
    return {
      active: tickets.filter((ticket) => ticket.status === "active").length,
      redeemed: tickets.filter((ticket) => ticket.status === "redeemed").length,
    };
  }, [data?.tickets]);

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <header className="border border-sera-sand/40 bg-sera-ivory p-6 md:p-8 rounded-2xl">
          <p className="sera-label text-sera-stone mb-3">Guest Experience</p>
          <h1 className="font-serif text-3xl text-sera-navy">Your event night</h1>
          {data?.event ? (
            <>
              <p className="text-sera-warm-grey mt-3">{data.event.title} · {new Date(data.event.starts_at).toLocaleString()}</p>
              <p className="text-sera-warm-grey text-sm mt-1">{data.event.venue ?? "Venue details coming soon"}</p>
            </>
          ) : (
            <p className="text-sera-warm-grey mt-3">No guest event has been linked to your account yet.</p>
          )}
        </header>

        <section className="grid grid-cols-2 gap-4">
          <article className="border border-sera-sand/40 bg-sera-ivory p-4">
            <p className="text-xs uppercase tracking-wider text-sera-stone">Available drink tickets</p>
            <p className="font-serif text-3xl text-sera-navy mt-2">{isLoading ? "…" : ticketStats.active}</p>
          </article>
          <article className="border border-sera-sand/40 bg-sera-ivory p-4">
            <p className="text-xs uppercase tracking-wider text-sera-stone">Redeemed</p>
            <p className="font-serif text-3xl text-sera-navy mt-2">{isLoading ? "…" : ticketStats.redeemed}</p>
          </article>
        </section>

        <section className="border border-sera-sand/40 bg-sera-ivory p-5 rounded-xl space-y-3">
          <h2 className="font-serif text-xl text-sera-navy">Ticket status</h2>
          {(data?.tickets ?? []).map((ticket) => (
            <div key={ticket.id} className="border border-sera-sand/30 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-sera-navy tracking-wide">{ticket.ticket_code}</p>
                <p className="text-xs text-sera-warm-grey mt-1">
                  {ticket.redeemed_at ? `Redeemed at ${new Date(ticket.redeemed_at).toLocaleTimeString()}` : "Ready for bartender validation"}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
            </div>
          ))}
          {(data?.tickets ?? []).length === 0 && <p className="text-sm text-sera-warm-grey">No tickets issued yet.</p>}

          <Button variant="sera" className="w-full mt-4 h-11">Redeem Drink (NFC / Tap-ready placeholder)</Button>
        </section>
      </main>
    </div>
  );
}
