import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { BackgroundPaperShader } from "@/components/ui/background-paper-shader";

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
  const sectionReveal = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  } as const;

  return (
    <div className="bg-background text-foreground">
      <div className="relative isolate overflow-hidden border-b border-sera-sand/65">
        <BackgroundPaperShader className="hidden md:block" intensity="balanced" />
        <BackgroundPaperShader className="md:hidden" />

        <section className="relative px-4 pb-20 pt-28 sm:px-6 md:pt-36 lg:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <motion.div
              initial="hidden"
              animate="show"
              variants={sectionReveal}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="sera-heading max-w-2xl text-4xl leading-tight text-sera-navy sm:text-5xl lg:text-6xl">
                Take hosting to the next level
              </h1>
              <p className="sera-body mt-6 max-w-2xl text-base text-sera-ink/85 sm:text-lg">
                Sera is the system behind a seamless event — designed invitations, guest control, event
                updates, and elegant night-of operations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="sera-ivory"
                  size="xl"
                  className="transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-18px_rgba(11,19,36,0.45)]"
                  asChild
                >
                  <Link to="/request-access">Request Access</Link>
                </Button>
                <Button
                  variant="sera-outline"
                  size="xl"
                  className="border-sera-navy/30 text-sera-navy transition-[transform,box-shadow,color,background-color] duration-300 hover:-translate-y-0.5 hover:bg-sera-navy hover:text-sera-ivory hover:shadow-[0_14px_24px_-18px_rgba(11,19,36,0.4)]"
                  asChild
                >
                  <Link to="/platform">
                    Explore Platform <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="relative min-h-[360px] sm:min-h-[390px]"
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.28)_42%,transparent_72%)]" />

              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <Glass strength="light" className="rounded-3xl border border-white/85 bg-white/72 p-5 shadow-[0_28px_70px_-42px_rgba(11,19,36,0.58)] backdrop-blur-xl sm:p-6">
                  <div className="flex items-center justify-between border-b border-sera-sand/70 pb-3">
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
                      <div key={label} className="rounded-xl border border-sera-sand/80 bg-white/70 p-3 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.12em] text-sera-stone">{label}</p>
                        <p className="mt-2 font-mono text-base text-sera-navy">{value}</p>
                      </div>
                    ))}
                  </div>
                </Glass>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 left-4 right-auto max-w-[220px]"
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.45, delay: 0.25 }}
              >
                <Glass strength="light" className="border-white/75 bg-white/70 p-3 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-sera-stone">Door throughput</p>
                  <p className="mt-2 font-mono text-sm text-sera-navy">26 guests/min</p>
                </Glass>
              </motion.div>

              <motion.div
                className="absolute -right-2 top-8 max-w-[190px]"
                initial={{ opacity: 0, x: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.45, delay: 0.3 }}
              >
                <Glass strength="light" className="border-white/75 bg-white/68 p-3 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-sera-stone">Sync status</p>
                  <p className="mt-2 font-mono text-sm text-sera-navy">All stations online</p>
                </Glass>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <motion.section
          className="relative px-4 py-20 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.34 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto max-w-6xl">
            <p className="sera-label text-sera-oxblood">Hosting is not just planning. It’s perception.</p>
          </div>
        </motion.section>

        <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {valueBlocks.map((block, index) => (
              <motion.article
                key={block.title}
                className="rounded-2xl border border-sera-sand/75 bg-white/85 p-6 backdrop-blur-[1px]"
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
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
      </div>

      <section className="border-y border-sera-sand/70 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {productMoments.map((moment, index) => (
            <motion.article
              key={moment.label}
              className="grid gap-5 rounded-2xl border border-sera-sand/75 bg-white p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.24 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
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
            <Button
              variant="sera-ivory"
              size="xl"
              className="transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-20px_rgba(11,19,36,0.4)]"
              asChild
            >
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button
              variant="sera-outline"
              size="xl"
              className="border-sera-navy/30 text-sera-navy transition-[transform,box-shadow,color,background-color] duration-300 hover:-translate-y-0.5 hover:bg-sera-navy hover:text-sera-ivory hover:shadow-[0_14px_26px_-20px_rgba(11,19,36,0.36)]"
              asChild
            >
              <Link to="/login">Organizer Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
