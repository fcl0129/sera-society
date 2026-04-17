// @ts-nocheck — legacy schema references; will be regenerated when platform tables exist
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, CalendarPlus, Users, Palette, ScanLine, Ticket, Globe, Settings } from "lucide-react";

const dashboardItems = [
  { icon: LayoutDashboard, title: "Overview", desc: "At-a-glance stats: upcoming events, total guests, pending RSVPs, active tickets." },
  { icon: CalendarPlus, title: "Create & Edit Events", desc: "Set up new events or update existing ones — date, venue, capacity, and more." },
  { icon: Users, title: "Guest List & RSVP", desc: "Manage invitations, track responses, add walk-ins, and export guest data." },
  { icon: Palette, title: "Invitation Builder", desc: "Design invitations and flyers with templates, typography, and full layout control." },
  { icon: Globe, title: "Event Page Editor", desc: "Customize and publish your guest-facing event website." },
  { icon: Ticket, title: "Drink Tickets", desc: "Configure, issue, and track digital drink tickets for your events." },
  { icon: ScanLine, title: "Check-In Console", desc: "Real-time check-in dashboard with QR/NFC scanning and guest status." },
  { icon: Settings, title: "Staff & Roles", desc: "Invite team members and assign roles — organizer, door, bartender." },
];

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
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Organizer Dashboard</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              Your event
              <br /><span className="italic">command center</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              Everything you need to create, manage, and run your events — in one place.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="bg-sera-navy p-6 md:p-10 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="sera-label text-sera-stone text-[9px] mb-1">Dashboard</p>
                <h3 className="font-serif text-sera-ivory text-lg font-light">Welcome back</h3>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/dashboard/events"
                  className="px-4 py-2 border border-sera-ink text-sera-sand text-[10px] tracking-widest uppercase"
                >
                  + New Event
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="p-4 border border-sera-ink/50">
                  <p className="text-sera-stone text-[9px] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="font-serif text-sera-ivory text-2xl font-light">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardItems.map((item, i) => (
              <motion.div
                key={item.title}
                className="p-6 border border-sera-sand/60 hover:border-sera-navy/20 bg-sera-ivory/50 transition-colors flex gap-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <item.icon className="w-5 h-5 text-sera-oxblood flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-sans text-sm font-medium text-sera-navy mb-1">{item.title}</h3>
                  <p className="sera-body text-sera-warm-grey text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="sera" size="lg" asChild>
              <Link to="/check-in">Open check-in console</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}