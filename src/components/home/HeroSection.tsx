import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";

const liveMetrics = [
  ["RSVP confirmations", "92.4%", "+1.8% / 5m"],
  ["Guests checked in", "184", "Gate throughput 26/min"],
  ["Tickets redeemed", "347", "Sync < 1.2s"],
  ["Avg. entry wait", "00:38", "-00:06 vs last wave"],
] as const;

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-28 md:pt-44">
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

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Glass strength="default" className="border-white/24 bg-sera-deep-navy/74 p-6 sm:p-8 lg:p-9">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-sera-sand/80">
              <span className="sera-label">Sera · Operating system for modern hospitality</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 font-mono text-emerald-200/95">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200 motion-reduce:animate-none" />
                Live
              </span>
            </div>

            <h1 className="sera-heading text-balance text-4xl leading-[0.98] text-white sm:text-5xl lg:text-7xl">
              Run every guest touchpoint from one event operating interface.
            </h1>

            <p className="sera-body mt-6 max-w-2xl text-pretty text-base text-sera-sand/90 md:text-lg">
              Sera unifies invitations, RSVP intelligence, check-in, and redemption so teams can execute
              high-volume events with the clarity and control of mission-critical software.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button variant="sera-ivory" size="xl" className="transition-transform duration-200 hover:-translate-y-0.5" asChild>
                <Link to="/request-access">Request Access</Link>
              </Button>
              <Button variant="sera-outline" size="xl" className="transition-transform duration-200 hover:-translate-y-0.5" asChild>
                <Link
                  to="/platform"
                  className="border-sera-ivory/72 text-sera-ivory hover:bg-sera-ivory hover:text-sera-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy"
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
          <Glass strength="default" glow className="border-white/24 bg-sera-charcoal/68 p-5 sm:p-6 lg:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-sera-ivory/15 pb-4">
              <p className="sera-label text-sera-sand/75">Live Event Preview</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200 motion-reduce:animate-none" />
                Session Active
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {liveMetrics.map(([label, value, note]) => (
                <Glass
                  key={label}
                  strength="light"
                  className="border-white/18 bg-sera-navy/70 p-4 transition-all duration-200 hover:border-white/28 hover:bg-sera-navy/74"
                >
                  <p className="text-xs uppercase tracking-[0.15em] text-sera-sand/70">{label}</p>
                  <p className="sera-metric mt-2 font-mono tracking-tight text-sera-ivory">{value}</p>
                  <p className="mt-1 font-mono text-[11px] text-sera-sand/70">{note}</p>
                </Glass>
              ))}
            </div>

            <div className="mt-5 border border-white/14 bg-sera-deep-navy/68 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="sera-label text-sera-sand/70">Now Monitoring</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sera-sand/65">Session ID · SERA-0418</p>
              </div>
              <p className="mt-2 text-sm text-sera-sand/90">
                Spring Collection Launch · Main Entrance, VIP Lane, and Bar Station connected.
              </p>
              <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[11px] text-sera-sand/70">
                Last sync 20:46:12 UTC
              </p>
            </div>
          </Glass>
        </motion.div>
      </div>
    </section>
  );
}
