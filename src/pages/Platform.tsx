import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CalendarDays, Palette, Users, Globe, Ticket, ShieldCheck, Smartphone, ScanLine } from "lucide-react";

const features = [
  { icon: CalendarDays, title: "Event Creation", desc: "Build events with full control over date, venue, capacity, ticketing, and every detail." },
  { icon: Palette, title: "Invitation & Flyer Design", desc: "Craft digital invitations and graphic flyers with editorial typography and layout freedom." },
  { icon: Users, title: "Guest List & RSVP", desc: "Manage invitations, track RSVPs, handle plus-ones, and segment guests by role or tier." },
  { icon: Globe, title: "Guest-Facing Event Page", desc: "Publish a polished, branded event website guests actually want to visit and share." },
  { icon: Ticket, title: "Digital Drink Tickets", desc: "Issue, distribute, and manage digital drink tickets redeemable by QR or NFC." },
  { icon: ShieldCheck, title: "Check-In & Access Control", desc: "Scan QR codes or tap NFC to validate guests. Real-time status for door staff." },
  { icon: ScanLine, title: "QR & NFC Redemption", desc: "Bartenders and staff scan or tap to redeem tickets, track usage, and prevent duplication." },
  { icon: Smartphone, title: "Mobile Operations", desc: "Every organizer and staff view is built mobile-first for the night of the event." },
];

export default function Platform() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Platform</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              The complete event
              <br /><span className="italic">platform</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              From invitation design to night-of operations, Sera covers the full event lifecycle in one premium platform.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="p-8 border border-sera-sand/60 hover:border-sera-navy/20 bg-sera-ivory/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <f.icon className="w-6 h-6 text-sera-oxblood mb-4" strokeWidth={1.5} />
                <h3 className="sera-subheading text-sera-navy text-xl mb-2">{f.title}</h3>
                <p className="sera-body text-sera-warm-grey text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
