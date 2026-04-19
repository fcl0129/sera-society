import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/marketing/PageHero";
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
      <PageHero
        eyebrow="Platform"
        title={
          <>
            The complete event
            <br />
            <span className="italic">platform</span>
          </>
        }
        description="From invitation design to night-of operations, Sera covers the full event lifecycle in one premium platform."
      />

      <section className="sera-surface-light py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-sera-ivory/50 p-8 transition-colors border border-sera-sand/60 hover:border-sera-navy/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <f.icon className="mb-4 h-6 w-6 text-sera-oxblood" strokeWidth={1.5} />
                <h3 className="sera-subheading mb-2 text-xl text-sera-navy">{f.title}</h3>
                <p className="sera-body text-sm text-sera-warm-grey">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
