import { motion } from "framer-motion";
import { CalendarDays, Palette, Users, ScanLine, Ticket, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Event architecture",
    desc: "Configure schedules, access rules, and event structure in one place.",
  },
  {
    icon: Palette,
    title: "Invitation direction",
    desc: "Design visual systems that stay consistent from first invite to event page.",
  },
  {
    icon: Users,
    title: "Guest intelligence",
    desc: "Track attendance intent, plus-ones, and segments before doors open.",
  },
  {
    icon: ScanLine,
    title: "Fast check-in",
    desc: "Verify guests in seconds with clear status and role-aware access.",
  },
  {
    icon: Ticket,
    title: "Redemption controls",
    desc: "Issue and validate hospitality allocations with live remaining counts.",
  },
  {
    icon: ShieldCheck,
    title: "Staff alignment",
    desc: "Keep hosts, door teams, and service stations synced on one event state.",
  },
];

const metrics = [
  { label: "Surface area", value: "One system" },
  { label: "Ops visibility", value: "Live" },
  { label: "Staff context", value: "Role-based" },
];

export default function FeaturesSection() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="sera-label mb-4 text-sera-stone/90">How it works</p>
            <h2 className="sera-heading text-3xl text-sera-navy sm:text-4xl">A single product, not a stack of tools</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/55 bg-white/72 p-3 text-center shadow-[0_14px_34px_-28px_rgba(8,14,28,0.7)] sm:p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-sera-stone">{metric.label}</p>
                <p className="mt-2 text-sm font-medium text-sera-navy/95">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.article
              key={feature.title}
              className="rounded-2xl border border-sera-sand/70 bg-sera-ivory/82 p-5 shadow-[0_18px_42px_-32px_rgba(8,14,28,0.78)] sm:p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <feature.icon className="mb-4 h-5 w-5 text-sera-oxblood" strokeWidth={1.7} />
              <h3 className="sera-subheading text-xl text-sera-navy">{feature.title}</h3>
              <p className="sera-body mt-2 text-sm text-sera-ink/80">{feature.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
