import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-36 md:pt-44 pb-20 md:pb-28">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px 480px at 10% 12%, rgba(155, 80, 80, 0.18), transparent 60%),
            radial-gradient(760px 420px at 82% 20%, rgba(214, 198, 160, 0.20), transparent 60%),
            linear-gradient(160deg, hsl(var(--sera-deep-navy)) 0%, hsl(var(--sera-navy)) 48%, hsl(var(--sera-charcoal)) 100%)
          `,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-10 items-end">
        <div>
          <motion.p
            className="sera-label text-sera-sand/70 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            An editorial operating system for modern hosts
          </motion.p>

          <motion.h1
            className="sera-heading text-sera-ivory text-5xl md:text-7xl lg:text-[92px] leading-[0.95] mb-8"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
          >
            Rewriting what
            <br />
            a private event
            <br />
            <span className="italic text-sera-beige">can feel like.</span>
          </motion.h1>

          <motion.p
            className="sera-body text-sera-sand/85 text-base md:text-lg max-w-2xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Sera Society brings invitation design, RSVP orchestration, access control, and guest
            operations into one polished canvas—with a visual language that feels authored, not
            templated.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button variant="sera-ivory" size="xl" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button variant="sera-outline" size="xl" asChild>
              <Link to="/platform" className="border-sera-ivory/60 text-sera-ivory hover:bg-sera-ivory hover:text-sera-navy">
                Explore Platform
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="border border-sera-ivory/20 p-6 md:p-8 bg-sera-charcoal/45 backdrop-blur-sm">
            <p className="sera-label text-sera-sand/75 mb-6">Issue 01 · Launch Narrative</p>
            <div className="space-y-5">
              {[
                ["01", "A distinct visual identity", "No default gradients. No generic social-club cues."],
                ["02", "Precision in guest flow", "Invitation, RSVP, entry, and bar redemption in one rhythm."],
                ["03", "Brandable by design", "Typography, layout, and motion that can become your signature."],
              ].map(([num, title, text]) => (
                <div key={num} className="grid grid-cols-[38px_1fr] gap-4 border-t border-sera-ivory/10 pt-4 first:border-t-0 first:pt-0">
                  <span className="font-serif text-sera-oxblood-soft text-xl">{num}</span>
                  <div>
                    <h3 className="font-serif text-sera-ivory text-xl leading-tight">{title}</h3>
                    <p className="text-sera-stone text-sm mt-1">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
