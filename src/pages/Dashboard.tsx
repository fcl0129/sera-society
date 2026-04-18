// @ts-nocheck — legacy schema references; will be regenerated when platform tables exist
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeEvents: 0,
    totalGuests: 0,
    pendingRsvps: 0,
    checkedIn: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<
    { id: string; title: string; starts_at: string; venue: string | null; status: string }[]
  >([]);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage(null);

      const [{ data: userData, error: userError }] = await Promise.all([supabase.auth.getUser()]);
      if (userError || !userData.user) {
        if (!mounted) return;
        setErrorMessage("Kunde inte läsa användarsession. Logga in igen.");
        setLoading(false);
        return;
      }

      const organizerId = userData.user.id;
      const nowIso = new Date().toISOString();

      const [{ count: activeEventsCount, error: eventsCountError }, { data: eventsData, error: eventsError }] =
        await Promise.all([
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("organizer_id", organizerId)
            .gte("starts_at", nowIso)
            .in("status", ["draft", "published"]),
          supabase
            .from("events")
            .select("id,title,starts_at,venue,status")
            .eq("organizer_id", organizerId)
            .gte("starts_at", nowIso)
            .order("starts_at", { ascending: true })
            .limit(5),
        ]);

      if (eventsCountError || eventsError) {
        if (!mounted) return;
        setErrorMessage("Kunde inte läsa eventdata just nu.");
        setLoading(false);
        return;
      }

      const eventIds = (eventsData ?? []).map((event) => event.id);

      let guestCount = 0;
      let pendingCount = 0;
      let checkedInCount = 0;

      if (eventIds.length > 0) {
        const [{ count: totalGuestsCount }, { count: pendingGuestsCount }, { count: checkinsCount }] = await Promise.all([
          supabase.from("guests").select("id", { count: "exact", head: true }).in("event_id", eventIds),
          supabase
            .from("guests")
            .select("id", { count: "exact", head: true })
            .in("event_id", eventIds)
            .eq("rsvp_status", "pending"),
          supabase.from("checkins").select("id", { count: "exact", head: true }).in("event_id", eventIds),
        ]);

        guestCount = totalGuestsCount ?? 0;
        pendingCount = pendingGuestsCount ?? 0;
        checkedInCount = checkinsCount ?? 0;
      }

      if (!mounted) return;

      setUpcomingEvents(eventsData ?? []);
      setStats({
        activeEvents: activeEventsCount ?? 0,
        totalGuests: guestCount,
        pendingRsvps: pendingCount,
        checkedIn: checkedInCount,
      });
      setLoading(false);
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      { label: "Active Events", value: String(stats.activeEvents) },
      { label: "Total Guests", value: String(stats.totalGuests) },
      { label: "Pending RSVPs", value: String(stats.pendingRsvps) },
      { label: "Checked In", value: String(stats.checkedIn) },
    ],
    [stats],
  );

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <Navbar />
      <section className="pt-32 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-2">Organizer Dashboard</p>
            <h1 className="sera-heading text-sera-navy text-3xl md:text-5xl mb-3">Overview</h1>
            <p className="sera-body text-sera-warm-grey text-base max-w-2xl">
              Track upcoming events, guests, and check-ins at a glance.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="bg-sera-ivory border border-sera-sand/60 p-6 md:p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="sera-label text-sera-stone text-[9px] mb-1">Dashboard</p>
                <h3 className="font-serif text-sera-navy text-lg font-light">Welcome back</h3>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/dashboard/events"
                  className="px-4 py-2 border border-sera-sand text-sera-navy text-[10px] tracking-widest uppercase"
                >
                  + New Event
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="p-4 border border-sera-sand/60 bg-sera-ivory/70">
                  <p className="text-sera-stone text-[9px] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="font-serif text-sera-navy text-2xl font-light">
                    {loading ? "…" : stat.value}
                  </p>
                </div>
              ))}
            </div>
            {errorMessage && <p className="text-xs text-sera-sand mt-4">{errorMessage}</p>}
          </motion.div>

          <motion.div
            className="bg-sera-ivory/40 border border-sera-sand/60 p-6 md:p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-sera-navy text-xl font-light">Upcoming events</h3>
              <Link to="/dashboard/events" className="text-xs text-sera-oxblood underline underline-offset-4">
                Manage events
              </Link>
            </div>
            {!loading && upcomingEvents.length === 0 ? (
              <p className="sera-body text-sera-warm-grey text-sm">
                Inga kommande events ännu. Skapa ditt första event för att komma igång.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-sera-sand/50 bg-sera-ivory">
                    <p className="font-sans text-sm font-medium text-sera-navy">{event.title}</p>
                    <p className="text-xs text-sera-warm-grey mt-1">
                      {new Date(event.starts_at).toLocaleString()} {event.venue ? `• ${event.venue}` : ""}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-sera-stone mt-2">{event.status}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/dashboard/events" className="p-4 border border-sera-sand/60 bg-sera-ivory hover:border-sera-navy/30 transition-colors">
              <p className="text-[10px] uppercase tracking-wider text-sera-stone mb-1">Events</p>
              <p className="text-sm text-sera-navy font-medium">Create and manage events</p>
            </Link>
            <Link to="/event-pages" className="p-4 border border-sera-sand/60 bg-sera-ivory hover:border-sera-navy/30 transition-colors">
              <p className="text-[10px] uppercase tracking-wider text-sera-stone mb-1">Invitations</p>
              <p className="text-sm text-sera-navy font-medium">Design and send invites</p>
            </Link>
            <Button variant="sera" size="lg" asChild className="h-auto p-0">
              <Link to="/check-in" className="p-4 w-full text-left">
                <p className="text-[10px] uppercase tracking-wider text-sera-stone mb-1">Check-in</p>
                <p className="text-sm font-medium">Open check-in console</p>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
