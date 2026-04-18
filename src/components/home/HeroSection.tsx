import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";

const liveMetrics = [
  ["RSVP confirmations", "92%"],
  ["Guests checked in", "184"],
  ["Tickets redeemed", "347"],
  ["Avg. entry wait", "38 sec"],
] as const;

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(760px 420px at 10% 12%, rgba(124, 58, 237, 0.22), transparent 62%),
            radial-gradient(760px 460px at 88% 16%, rgba(56, 189, 248, 0.16), transparent 64%),
            linear-gradient(162deg, hsl(var(--sera-deep-navy)) 0%, hsl(var(--sera-navy)) 48%, #040810 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Glass strength="default" className="border-white/15 bg-sera-deep-navy/50 p-6 sm:p-8 lg:p-10">
            <p className="sera-label mb-5 text-sera-sand/80">Sera · Operating system for modern hospitality</p>

            <h1 className="sera-heading text-balance text-4xl leading-[0.98] text-white sm:text-5xl lg:text-7xl">
              Run every guest touchpoint from one event operating interface.
            </h1>

            <p className="sera-body mt-6 max-w-2xl text-pretty text-base text-sera-sand/90 md:text-lg">
              Sera unifies invitations, RSVP intelligence, check-in, and redemption so teams can execute
              high-volume events with the clarity and control of mission-critical software.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button variant="sera-ivory" size="xl" asChild>
                <Link to="/request-access">Request Access</Link>
              </Button>
              <Button variant="sera-outline" size="xl" asChild>
                <Link
                  to="/platform"
                  className="border-sera-ivory/60 text-sera-ivory hover:bg-sera-ivory hover:text-sera-navy"
                >
                  Explore Platform <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </Glass>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <Glass strength="strong" glow className="border-white/20 bg-sera-charcoal/55 p-5 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-sera-ivory/15 pb-4">
              <p className="sera-label text-sera-sand/75">Live Event Preview</p>
              <span className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                Session Active
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {liveMetrics.map(([label, value]) => (
                <Glass
                  key={label}
                  strength="light"
                  className="border-white/10 bg-sera-navy/45 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.15em] text-sera-sand/70">{label}</p>
                  <p className="sera-metric mt-2 text-sera-ivory">{value}</p>
                </Glass>
              ))}
            </div>

            <div className="mt-5 border border-white/10 bg-sera-deep-navy/65 p-4">
              <p className="sera-label text-sera-sand/70">Now Monitoring</p>
              <p className="mt-2 text-sm text-sera-sand/90">
                Spring Collection Launch · Main Entrance, VIP Lane, and Bar Station connected.
              </p>
            </div>
          </Glass>
        </motion.div>
      </div>
    </section>
  );
}
