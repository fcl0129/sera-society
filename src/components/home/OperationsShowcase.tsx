import { motion } from "framer-motion";
import { ScanLine, Smartphone, Beer, UserCheck } from "lucide-react";

const ops = [
  {
    icon: ScanLine,
    title: "QR code scanning",
    desc: "Every guest gets a unique QR code. Scan at the door for instant validation.",
  },
  {
    icon: Smartphone,
    title: "NFC tap-in",
    desc: "Support NFC-enabled devices for frictionless tap-to-enter check-in flows.",
  },
  {
    icon: Beer,
    title: "Drink ticket redemption",
    desc: "Bartenders scan or tap to redeem digital drink tickets in real time.",
  },
  {
    icon: UserCheck,
    title: "Live guest status",
    desc: "See who's checked in, who hasn't arrived, and manage walk-ins on the fly.",
  },
];

export default function OperationsShowcase() {
  return (
    <section className="py-24 md:py-32 sera-gradient-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sera-ivory)) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="sera-label text-sera-oxblood-soft mb-4">Night-Of Operations</p>
          <h2 className="sera-heading text-sera-ivory text-4xl md:text-5xl">
            Built for the night
            <br />
            <span className="italic">your event happens</span>
          </h2>
          <p className="sera-body text-sera-sand mt-6 max-w-xl mx-auto">
            Sera doesn't stop at the invitation. It powers check-in, access control, and drink-ticket redemption — all from a phone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ops.map((op, i) => (
            <motion.div
              key={op.title}
              className="p-8 border border-sera-ink/60 hover:border-sera-sand/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <op.icon className="w-6 h-6 text-sera-oxblood-soft mb-5" strokeWidth={1.5} />
              <h3 className="sera-subheading text-sera-ivory text-lg mb-2">{op.title}</h3>
              <p className="sera-body text-sera-stone text-sm">{op.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
