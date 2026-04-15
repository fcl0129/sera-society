import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
                <div className="px-4 py-2 border border-sera-ink text-sera-sand text-[10px] tracking-widest uppercase">
                  + New Event
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Events", value: "3" },
                { label: "Total Guests", value: "284" },
                { label: "Pending RSVPs", value: "47" },
                { label: "Tickets Issued", value: "156" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 border border-sera-ink/50">
                  <p className="text-sera-stone text-[9px] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="font-serif text-sera-ivory text-2xl font-light">{stat.value}</p>
                </div>
              ))}
            </div>
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
              <Link to="/login">Sign In to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
