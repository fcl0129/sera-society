import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { GooeyTextMorphing } from "@/components/ui/gooey-text-morphing";
import { Splite } from "@/components/ui/splite";

const heroWords = ["private dinners", "launch nights", "member salons", "brand activations"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px 500px at 8% 14%, rgba(155, 80, 80, 0.2), transparent 62%),
            radial-gradient(760px 420px at 85% 14%, rgba(214, 198, 160, 0.2), transparent 62%),
            linear-gradient(155deg, hsl(var(--sera-deep-navy)) 0%, hsl(var(--sera-navy)) 52%, hsl(var(--sera-charcoal)) 100%)
          `,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <motion.p
            className="sera-label mb-8 text-sera-sand/70"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Sera Society · The operating layer for modern hospitality
          </motion.p>

          <motion.h1
            className="sera-heading mb-8 text-5xl leading-[0.95] text-sera-ivory md:text-7xl lg:text-[86px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            Host unforgettable
            <br />
            <span className="text-sera-beige">
              <GooeyTextMorphing words={heroWords} interval={2200} />
            </span>
            <br />
            with precision.
          </motion.h1>

          <motion.p
            className="sera-body mb-10 max-w-2xl text-base text-sera-sand/85 md:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            Design invitation pages, manage RSVPs, run check-in, and redeem drinks from one polished
            system. Sera gives your team the control of operations software with the feel of a luxury
            brand experience.
          </motion.p>

          <motion.div
            className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            <Button variant="sera-ivory" size="xl" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button variant="sera-outline" size="xl" asChild>
              <Link
                to="/platform"
                className="border-sera-ivory/60 text-sera-ivory hover:bg-sera-ivory hover:text-sera-navy"
              >
                Explore Platform
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
        >
          <div className="relative overflow-hidden border border-sera-ivory/20 bg-sera-charcoal/50 p-5 backdrop-blur-sm md:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-sera-ivory/15 pb-4">
              <p className="sera-label text-sera-sand/75">Live Event Control</p>
              <span className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                Session Active
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["RSVP confirmations", "92%"],
                ["Guests checked in", "184"],
                ["Tickets redeemed", "347"],
                ["Avg. entry wait", "38 sec"],
              ].map(([label, value]) => (
                <div key={label} className="border border-sera-ivory/12 bg-sera-navy/30 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-sera-sand/65">{label}</p>
                  <p className="mt-2 font-serif text-2xl text-sera-ivory">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 hidden h-52 overflow-hidden border border-sera-ivory/12 lg:block">
              <Splite
                scene="https://my.spline.design/particlesphere-9a5f9f8b4f3e8f8a92f5f7f1b2238a1b/"
                title="Sera hero ambient scene"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sera-charcoal via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
