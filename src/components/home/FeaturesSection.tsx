import { motion } from "framer-motion";
import { CalendarDays, Palette, Users, Globe, Ticket, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Event architecture",
    desc: "Shape each gathering with intentional structure—capacity, pacing, and timeline in one control plane.",
  },
  {
    icon: Palette,
    title: "Editorial invitation studio",
    desc: "Build distinctive invitation systems with expressive typography, layout rhythm, and art direction.",
  },
  {
    icon: Users,
    title: "Guest intelligence",
    desc: "Track attendance, plus-ones, preferences, and segments with live clarity before doors open.",
  },
  {
    icon: Globe,
    title: "Narrative event pages",
    desc: "Publish immersive event pages that feel like magazines, not generic registration forms.",
  },
  {
    icon: Ticket,
    title: "Cashless hospitality",
    desc: "Issue drink allocations and benefits digitally, with redemptions synced to every station in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Door precision",
    desc: "Coordinate hosts, staff, and bar teams with one source of truth for access and status.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 bg-sera-ivory">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="sera-label text-sera-oxblood mb-4">System Capabilities</p>
            <h2 className="sera-heading text-sera-navy text-4xl md:text-6xl leading-[0.98]">
              Tools for hosts
              <br />
              with a point
              <br />
              <span className="italic">of view</span>
            </h2>
          </div>
          <p className="sera-body text-sera-warm-grey text-lg max-w-2xl lg:pt-16">
            We designed Sera to feel like an editorial suite and an operations desk at once. Every
            feature is crafted to support a sharper brand expression and cleaner event execution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-sera-sand/70">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-8 md:p-9 border-b border-sera-sand/70 md:[&:nth-child(odd)]:border-r lg:[&:not(:nth-child(3n))]:border-r lg:[&:nth-last-child(-n+3)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <feature.icon className="w-5 h-5 text-sera-oxblood mb-5" strokeWidth={1.6} />
              <h3 className="sera-subheading text-sera-navy text-2xl mb-3 leading-tight">{feature.title}</h3>
              <p className="sera-body text-sera-warm-grey text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
