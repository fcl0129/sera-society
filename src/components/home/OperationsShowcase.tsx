import { motion } from "framer-motion";
import { ScanLine, Smartphone, Beer, UserCheck } from "lucide-react";

const ops = [
  {
    icon: ScanLine,
    title: "Door scanning",
    desc: "Unique credentials verify instantly to keep queues moving.",
  },
  {
    icon: Smartphone,
    title: "Tap check-in",
    desc: "NFC flows accelerate return guests and VIP entry moments.",
  },
  {
    icon: Beer,
    title: "Live redemption",
    desc: "Hospitality allocations update immediately at every service station.",
  },
  {
    icon: UserCheck,
    title: "Attendance view",
    desc: "Hosts and operators share one real-time picture of room momentum.",
  },
];

export default function OperationsShowcase() {
  return (
    <section className="sera-section bg-sera-deep-navy/96 px-4 sm:px-6 lg:px-8 text-sera-ivory">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="sera-label mb-4 text-sera-oxblood-soft">How it performs</p>
            <h2 className="sera-heading text-3xl sm:text-4xl">Operations that hold up under live pressure</h2>
          </div>
          <p className="sera-body text-sm text-sera-stone sm:text-base">
            Sera keeps the room elegant for guests while giving teams fast controls, clear status,
            and shared context during peak moments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ops.map((op, i) => (
            <motion.article
              key={op.title}
              className="rounded-2xl border border-white/15 bg-white/5 p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <op.icon className="mb-4 h-5 w-5 text-sera-oxblood-soft" strokeWidth={1.7} />
              <h3 className="sera-subheading text-xl text-sera-ivory">{op.title}</h3>
              <p className="sera-body mt-2 text-sm text-sera-stone">{op.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
