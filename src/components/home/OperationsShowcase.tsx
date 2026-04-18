import { motion } from "framer-motion";
import { ScanLine, Smartphone, Beer, UserCheck } from "lucide-react";

const ops = [
  {
    icon: ScanLine,
    title: "Door scanning",
    desc: "Unique credentials verify instantly to keep queues moving.",
    metric: "26 scans/min",
    state: "Nominal",
  },
  {
    icon: Smartphone,
    title: "Tap check-in",
    desc: "NFC flows accelerate return guests and VIP entry moments.",
    metric: "02.1s avg tap",
    state: "Live",
  },
  {
    icon: Beer,
    title: "Live redemption",
    desc: "Hospitality allocations update immediately at every service station.",
    metric: "347 redeemed",
    state: "Syncing",
  },
  {
    icon: UserCheck,
    title: "Attendance view",
    desc: "Hosts and operators share one real-time picture of room momentum.",
    metric: "184 in venue",
    state: "Updated",
  },
];

export default function OperationsShowcase() {
  return (
    <section className="sera-section bg-sera-deep-navy/95 px-4 text-sera-ivory sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="sera-label mb-4 text-sera-oxblood-soft">How it performs</p>
            <h2 className="sera-heading text-3xl sm:text-4xl">Operations that hold up under live pressure</h2>
          </div>
          <p className="sera-body text-sm text-sera-sand/88 sm:text-base">
            Sera keeps the room elegant for guests while giving teams fast controls, clear status,
            and shared context during peak moments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ops.map((op, i) => (
            <motion.article
              key={op.title}
              className="rounded-2xl border border-white/24 bg-white/[0.11] p-5 shadow-[0_22px_52px_-40px_rgba(4,9,20,0.95)] transition-colors duration-200 hover:border-white/34 hover:bg-white/[0.14] sm:p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <op.icon className="h-5 w-5 text-sera-oxblood-soft" strokeWidth={1.7} />
                <span className="inline-flex items-center gap-1 rounded-full border border-white/25 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-sera-sand/90">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200/85 motion-reduce:animate-none" />
                  {op.state}
                </span>
              </div>
              <h3 className="sera-subheading text-xl text-sera-ivory">{op.title}</h3>
              <p className="sera-body mt-2 text-sm text-sera-sand/88">{op.desc}</p>
              <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-sera-sand/75">
                {op.metric}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
