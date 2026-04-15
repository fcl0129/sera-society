import { motion } from "framer-motion";
import { CalendarDays, Palette, Users, Globe, Ticket, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Create & manage events",
    desc: "Build your event from scratch — set the date, venue, capacity, and every detail that matters.",
  },
  {
    icon: Palette,
    title: "Design invitations & flyers",
    desc: "Craft beautiful digital invitations and graphic flyers with full editorial control.",
  },
  {
    icon: Users,
    title: "Guest list & RSVP",
    desc: "Manage your guest list, track responses, and handle plus-ones with ease.",
  },
  {
    icon: Globe,
    title: "Guest-facing event page",
    desc: "Publish a polished event website your guests actually want to visit.",
  },
  {
    icon: Ticket,
    title: "Digital drink tickets",
    desc: "Issue and manage digital drink tickets — redeemable via QR or NFC on the night.",
  },
  {
    icon: ShieldCheck,
    title: "Check-in & access control",
    desc: "Scan guests in with QR and NFC. Real-time status for organizers, door staff, and bartenders.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 sera-surface-light">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="sera-label text-sera-oxblood mb-4">The Full Event Lifecycle</p>
          <h2 className="sera-heading text-sera-navy text-4xl md:text-5xl">
            Everything your event needs,
            <br />
            <span className="italic">nothing it doesn't</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-8 border border-sera-sand/60 hover:border-sera-navy/20 bg-sera-ivory/50 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <feature.icon className="w-6 h-6 text-sera-oxblood mb-5" strokeWidth={1.5} />
              <h3 className="sera-subheading text-sera-navy text-xl mb-3">{feature.title}</h3>
              <p className="sera-body text-sera-warm-grey text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
