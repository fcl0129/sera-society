import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const valueBlocks = [
  {
    title: "Designed to set the tone",
    detail:
      "Craft invitation and event touchpoints that communicate intent before guests even arrive.",
    bullets: ["Editorial invitation direction", "Consistent event page language", "Curated RSVP experience"],
  },
  {
    title: "Built for control",
    detail:
      "Coordinate guest lists, check-in flow, and live updates from one operational surface.",
    bullets: ["Guest segmentation", "Real-time status visibility", "Role-aware staff access"],
  },
  {
    title: "Made for the room itself",
    detail:
      "Support the live event with elegant, fast interfaces for hosts, door teams, and stations.",
    bullets: ["Fast check-in states", "Live event updates", "Night-of redemption operations"],
  },
] as const;

const productMoments = [
  {
    label: "01 · Invitations",
    title: "Designed invitations with clear intent",
    body: "Define tone, control distribution, and align every invitation to the event's identity.",
    panel: ["Template: Evening Editorial", "Audience: VIP + General", "Status: Ready to send"],
  },
  {
    label: "02 · Guest control",
    title: "Guest structure with operational clarity",
    body: "Manage lists, tiers, and access states so teams can execute confidently at any scale.",
    panel: ["Segments: 4 active", "Check-in lanes: 3", "Overrides: Staff-only"],
  },
  {
    label: "03 · Event updates",
    title: "Live event updates that keep teams aligned",
    body: "Broadcast timing, access, and service changes instantly across the operational floor.",
    panel: ["Current note: Main doors open", "Last update: 21:14", "Reach: Host + Door + Bar"],
  },
  {
    label: "04 · Night-of operations",
    title: "Elegant tools for the event in motion",
    body: "Run check-in and hospitality moments with responsive interfaces built for real venues.",
    panel: ["Scan status: Live", "Queue: 12 guests", "Service station: Synced"],
  },
] as const;

export default function LandingRebuild() {
  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-sera-sand/70 px-4 pb-20 pt-28 sm:px-6 md:pt-36 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="sera-heading max-w-2xl text-4xl leading-tight text-sera-navy sm:text-5xl lg:text-6xl">
              Take hosting to the next level
            </h1>
            <p className="sera-body mt-6 max-w-2xl text-base text-sera-ink/85 sm:text-lg">
              Sera is the system behind a seamless event — designed invitations, guest control, event
              updates, and elegant night-of operations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="sera-ivory" size="xl" asChild>
                <Link to="/request-access">Request Access</Link>
              </Button>
              <Button variant="sera-outline" size="xl" className="border-sera-navy/30 text-sera-navy hover:bg-sera-navy hover:text-sera-ivory" asChild>
                <Link to="/platform">
                  Explore Platform <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-sera-sand/80 bg-white p-5 shadow-[0_22px_55px_-40px_rgba(11,19,36,0.55)] sm:p-6">
            <div className="flex items-center justify-between border-b border-sera-sand/75 pb-3">
              <p className="sera-label text-sera-stone">Event control</p>
              <span className="text-xs uppercase tracking-[0.12em] text-sera-stone">Live session</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["RSVP", "92%"],
                ["Checked in", "184"],
                ["Queue", "00:38"],
                ["Stations", "3 synced"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-sera-sand/80 bg-sera-ivory/45 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-sera-stone">{label}</p>
                  <p className="mt-2 font-mono text-base text-sera-navy">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="sera-label text-sera-oxblood">Hosting is not just planning. It’s perception.</p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {valueBlocks.map((block, index) => (
            <motion.article
              key={block.title}
              className="rounded-2xl border border-sera-sand/75 bg-white p-6"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <h2 className="sera-subheading text-xl text-sera-navy">{block.title}</h2>
              <p className="sera-body mt-3 text-sm text-sera-ink/80">{block.detail}</p>
              <ul className="mt-5 space-y-2">
                {block.bullets.map((item) => (
                  <li key={item} className="text-sm text-sera-ink/78">• {item}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-sera-sand/70 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {productMoments.map((moment, index) => (
            <motion.article
              key={moment.label}
              className="grid gap-5 rounded-2xl border border-sera-sand/75 bg-white p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <div>
                <p className="sera-label text-sera-stone">{moment.label}</p>
                <h3 className="sera-subheading mt-3 text-2xl text-sera-navy">{moment.title}</h3>
                <p className="sera-body mt-3 max-w-xl text-sm text-sera-ink/80">{moment.body}</p>
              </div>
              <div className="rounded-xl border border-sera-sand/80 bg-sera-ivory/45 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-sera-stone">UI Preview</p>
                <div className="mt-3 space-y-2">
                  {moment.panel.map((line) => (
                    <p key={line} className="rounded-md border border-sera-sand/75 bg-white px-3 py-2 font-mono text-xs text-sera-ink/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="sera-label text-sera-oxblood">Host with intention</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="sera-ivory" size="xl" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button variant="sera-outline" size="xl" className="border-sera-navy/30 text-sera-navy hover:bg-sera-navy hover:text-sera-ivory" asChild>
              <Link to="/login">Organizer Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
