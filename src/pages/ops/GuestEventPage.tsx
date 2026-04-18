import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const eventDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

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
      available: tickets.filter((ticket) => ticket.status === "active").length,
      redeemed: tickets.filter((ticket) => ticket.status === "redeemed").length,
      hasAccess: tickets.some((ticket) => ticket.status === "active"),
    };
  }, [data?.tickets]);

  const guestFirstName = useMemo(() => {
    const fullName = data?.guest?.full_name;
    if (!fullName) return "Guest";
    return fullName.split(" ")[0];
  }, [data?.guest?.full_name]);

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <section className="rounded-3xl border border-sera-sand/40 bg-gradient-to-b from-sera-ivory to-sera-ivory/80 p-7 md:p-10 shadow-[0_10px_30px_rgba(25,34,51,0.06)]">
          <p className="sera-label mb-4 text-sera-stone">Your evening</p>

          {data?.event ? (
            <>
              <h1 className="font-serif text-3xl leading-tight text-sera-navy md:text-5xl">{data.event.title}</h1>
              <p className="mt-4 max-w-xl text-sera-warm-grey">
                Welcome, {guestFirstName}. Your invitation details are prepared below for a smooth arrival.
              </p>
              <div className="mt-6 space-y-2 border-t border-sera-sand/40 pt-5 text-sm text-sera-warm-grey md:text-base">
                <p>{eventDateTimeFormatter.format(new Date(data.event.starts_at))}</p>
                <p>{data.event.venue ?? "Venue details will be shared with your host release."}</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl leading-tight text-sera-navy md:text-5xl">Your invitation is being prepared</h1>
              <p className="mt-4 max-w-xl text-sera-warm-grey">
                Event details will appear here as soon as your host releases your evening access.
              </p>
            </>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-sera-sand/40 bg-sera-ivory/95 p-6 md:p-8">
          <div className="flex items-end justify-between gap-4 border-b border-sera-sand/40 pb-4">
            <div>
              <p className="sera-label text-sera-stone">Your access</p>
              <h2 className="mt-1 font-serif text-2xl text-sera-navy">Drink service</h2>
            </div>
            {!isLoading && data?.event && (
              <p className="text-right text-sm text-sera-warm-grey">
                {ticketStats.available > 0
                  ? `${ticketStats.available} ready for the evening`
                  : "Awaiting release"}
              </p>
            )}
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-sera-warm-grey">Preparing your evening details…</p>
          ) : (
            <div className="mt-5 space-y-3">
              {(data?.tickets ?? []).map((ticket) => (
                <article
                  key={ticket.id}
                  className="flex items-center justify-between rounded-xl border border-sera-sand/35 bg-sera-surface-light/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm tracking-wide text-sera-navy">{ticket.ticket_code}</p>
                    <p className="mt-1 text-xs text-sera-warm-grey">
                      {ticket.redeemed_at
                        ? `Presented at ${new Date(ticket.redeemed_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                        : "Ready for the evening"}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-sera-sand/60 bg-sera-ivory/80 text-sera-navy">
                    {ticket.status === "redeemed" ? "Presented" : "Available"}
                  </Badge>
                </article>
              ))}

              {(data?.tickets ?? []).length === 0 && (
                <div className="rounded-xl border border-dashed border-sera-sand/60 bg-sera-surface-light/40 p-5">
                  <p className="text-sm text-sera-warm-grey">Access will appear here once your host opens drink service.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-sera-sand/40 pt-5">
            <p className="text-sm text-sera-warm-grey">Your invitation includes {ticketStats.redeemed} already presented this evening.</p>
            <Button variant="sera" className="h-11 min-w-44" disabled={!ticketStats.hasAccess}>
              Access drink service
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
