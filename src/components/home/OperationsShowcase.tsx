import { motion } from "framer-motion";
import { ScanLine, Smartphone, Beer, UserCheck } from "lucide-react";

const ops = [
  {
    icon: ScanLine,
    title: "Door scanning",
    desc: "Unique guest credentials verify in seconds so queues stay short and entry stays controlled.",
  },
  {
    icon: Smartphone,
    title: "Tap-based check-in",
    desc: "NFC-ready flows deliver near-invisible entry for VIPs and returning guests.",
  },
  {
    icon: Beer,
    title: "Bar redemption",
    desc: "Drink allocations update live after each redemption to keep hospitality fair and fast.",
  },
  {
    icon: UserCheck,
    title: "Live attendance map",
    desc: "Hosts and staff share a real-time view of arrivals, no-shows, and in-room momentum.",
  },
];

export default function OperationsShowcase() {
  return (
    <section className="py-24 md:py-32 bg-sera-deep-navy text-sera-ivory relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.06) 48%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="sera-label text-sera-oxblood-soft mb-4">Operations Layer</p>
            <h2 className="sera-heading text-sera-ivory text-4xl md:text-6xl leading-[0.98]">
              Beautiful before doors,
              <br />
              exact at doors.
            </h2>
          </div>
          <p className="sera-body text-sera-sand/80 text-lg max-w-xl">
            Design credibility means little without operational fluency. Sera keeps your event
            aesthetic and your on-site systems aligned from first RSVP to final pour.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ops.map((op, i) => (
            <motion.div
              key={op.title}
              className="p-8 border border-sera-ink/70 bg-sera-navy/40"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <op.icon className="w-6 h-6 text-sera-oxblood-soft mb-5" strokeWidth={1.5} />
              <h3 className="sera-subheading text-sera-ivory text-xl mb-2">{op.title}</h3>
              <p className="sera-body text-sera-stone text-sm">{op.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
