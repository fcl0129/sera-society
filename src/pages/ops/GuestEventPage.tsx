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
      hasAnyTickets: tickets.length > 0,
      hasActiveAccess: tickets.some((ticket) => ticket.status === "active"),
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
        <section className="rounded-3xl border border-sera-sand/35 bg-gradient-to-b from-sera-ivory to-sera-ivory/85 p-7 md:p-10 shadow-[0_12px_32px_rgba(25,34,51,0.06)]">
          <p className="sera-label mb-4 text-sera-stone">Guest access</p>

          {data?.event ? (
            <>
              <h1 className="font-serif text-3xl leading-tight text-sera-navy md:text-5xl">{data.event.title}</h1>
              <p className="mt-4 max-w-xl text-sera-warm-grey">
                Welcome, {guestFirstName}. Your evening details are curated here for a seamless arrival.
              </p>
              <div className="mt-6 space-y-2 border-t border-sera-sand/40 pt-5 text-sm text-sera-warm-grey md:text-base">
                <p>{eventDateTimeFormatter.format(new Date(data.event.starts_at))}</p>
                <p>{data.event.venue ?? "Venue details will be shared by your host shortly."}</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl leading-tight text-sera-navy md:text-5xl">Your evening is being prepared</h1>
              <p className="mt-4 max-w-xl text-sera-warm-grey">
                Your host will release event details here once your access is ready.
              </p>
            </>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-sera-sand/40 bg-sera-ivory/95 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sera-sand/35 pb-5">
            <div>
              <p className="sera-label text-sera-stone">Your access</p>
              <h2 className="mt-1 font-serif text-2xl text-sera-navy">Invitation status</h2>
            </div>
            {!isLoading && (
              <Badge variant="outline" className="rounded-full border-sera-sand/60 bg-sera-ivory px-3 py-1 text-sera-navy">
                {!data?.event
                  ? "Awaiting release"
                  : ticketStats.hasActiveAccess
                    ? "Included with your evening"
                    : ticketStats.hasAnyTickets
                      ? "Presented this evening"
                      : "Awaiting release"}
              </Badge>
            )}
          </div>

          {isLoading ? <p className="mt-6 text-sm text-sera-warm-grey">Preparing your evening details…</p> : null}

          {!isLoading && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <p className="text-lg text-sera-navy">
                  {!data?.event
                    ? "Your invitation is in preparation."
                    : ticketStats.hasActiveAccess
                      ? "Drink service is included with your evening."
                      : ticketStats.hasAnyTickets
                        ? "Your issued service has been presented."
                        : "Drink service will appear once released by your host."}
                </p>
                <p className="text-sm text-sera-warm-grey">
                  {!data?.event
                    ? "Please check back shortly for your full event details."
                    : ticketStats.hasActiveAccess
                      ? `${ticketStats.available} invitation ${ticketStats.available === 1 ? "selection is" : "selections are"} available to present.`
                      : ticketStats.redeemed > 0
                        ? `${ticketStats.redeemed} invitation ${ticketStats.redeemed === 1 ? "selection has" : "selections have"} already been presented this evening.`
                        : "Your host is finalizing access and timing."}
                </p>
              </div>

              {data?.event && ticketStats.hasActiveAccess && (
                <div className="border-t border-sera-sand/35 pt-5">
                  <Button variant="sera" className="h-11 min-w-44">
                    Present access
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
