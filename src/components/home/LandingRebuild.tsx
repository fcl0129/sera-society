import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const hostingJourney = [
  {
    title: "Set the tone",
    description:
      "Open with an invitation language that feels considered from the first line, the first image, and the first RSVP response.",
  },
  {
    title: "Gather your guests",
    description:
      "Shape each list with intention, from early confirmations to final arrivals, with clarity for every host and team member.",
  },
  {
    title: "Shape the experience",
    description:
      "Curate event pages, pacing notes, and service details so each moment feels coherent and quietly memorable.",
  },
  {
    title: "Run it beautifully",
    description:
      "Carry that same calm to the door and across the room with precise check-in and live event coordination.",
  },
] as const;

const visualMoments = [
  {
    label: "Invitation",
    title: "A first impression with presence",
    lines: ["Editorial cover", "Private link flow", "Thoughtful reply prompts"],
  },
  {
    label: "RSVP",
    title: "Responses with context, not noise",
    lines: ["Tiered guest states", "Dietary and seating notes", "Host-side visibility"],
  },
  {
    label: "Event page",
    title: "A composed destination for the night",
    lines: ["Schedule framing", "Venue guidance", "Last-minute updates"],
  },
  {
    label: "Check-in",
    title: "Door flow that feels effortless",
    lines: ["Fast lookup and scan", "Live arrival rhythm", "Confident team handoff"],
  },
] as const;

const useCases = [
  "Private dinners",
  "Brand events",
  "Celebrations",
  "Curated gatherings",
] as const;

const capabilities = [
  "Invitation composition with branded editorial direction",
  "Guest list curation with flexible access states",
  "Event pages that hold the narrative of the evening",
  "On-site tools for check-in, service teams, and flow notes",
] as const;

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingRebuild() {
  return (
    <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section className="px-4 pb-24 pt-28 sm:px-6 md:pb-28 md:pt-36 lg:px-8 lg:pt-40">
        <motion.div
          className="mx-auto max-w-6xl"
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-6 text-sm font-medium tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">
            Private platform for modern event hosting
          </p>
          <h1 className="sera-heading max-w-4xl text-[clamp(2.9rem,8vw,7rem)] font-medium leading-[0.95] text-[hsl(var(--sera-ink-brown))]">
            Host something worth remembering.
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-[hsl(var(--sera-ink-brown)/0.82)] sm:text-lg">
            A private platform for invitations, guest management, and event flow — designed to make hosting feel seamless from the start.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="xl"
              className="rounded-full bg-[hsl(var(--sera-ink-brown))] px-8 text-[hsl(var(--sera-ivory-paper))] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="rounded-full border-[hsl(var(--sera-warm-stone))] bg-transparent px-8 text-[hsl(var(--sera-ink-brown))] transition-colors duration-300 hover:bg-[hsl(var(--sera-porcelain-rose))]"
            >
              <Link to="/platform">Explore the platform</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[hsl(var(--sera-warm-stone)/0.65)] bg-[hsl(var(--sera-porcelain-rose)/0.45)] px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="sera-subheading text-3xl text-[hsl(var(--sera-ink-brown))] sm:text-4xl">
            Hosting is a feeling before it becomes an event.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[hsl(var(--sera-ink-brown)/0.76)]">
            Sera Society is built for teams who care about atmosphere, timing, and the quiet precision that makes a night feel effortless.
          </p>
        </motion.div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-14">
          {hostingJourney.map((item, index) => (
            <motion.article
              key={item.title}
              className="rounded-[1.7rem] border border-[hsl(var(--sera-warm-stone)/0.6)] bg-[hsl(var(--sera-ivory-paper)/0.84)] p-8 shadow-[0_22px_40px_-34px_rgba(42,36,33,0.38)]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <p className="mb-4 text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">0{index + 1}</p>
              <h2 className="sera-subheading text-4xl text-[hsl(var(--sera-ink-brown))]">{item.title}</h2>
              <p className="mt-4 text-[hsl(var(--sera-ink-brown)/0.78)]">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-[hsl(var(--sera-soft-blush)/0.42)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h3 className="sera-subheading max-w-2xl text-4xl text-[hsl(var(--sera-ink-brown))] sm:text-5xl">A visual rhythm across every guest touchpoint.</h3>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {visualMoments.map((moment, index) => (
              <motion.article
                key={moment.label}
                className="rounded-[1.55rem] border border-[hsl(var(--sera-warm-stone)/0.65)] bg-[hsl(var(--sera-ivory-paper)/0.9)] p-7"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <p className="text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">{moment.label}</p>
                <h4 className="mt-3 text-2xl font-medium text-[hsl(var(--sera-ink-brown))]">{moment.title}</h4>
                <div className="mt-5 space-y-2">
                  {moment.lines.map((line) => (
                    <p
                      key={line}
                      className="rounded-xl border border-[hsl(var(--sera-warm-stone)/0.62)] bg-[hsl(var(--sera-porcelain-rose)/0.56)] px-4 py-2.5 text-sm text-[hsl(var(--sera-ink-brown)/0.82)]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">Designed for</p>
            <h3 className="sera-subheading mt-3 text-4xl text-[hsl(var(--sera-ink-brown))] sm:text-5xl">Gatherings where detail matters.</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                key={useCase}
                className="rounded-2xl border border-[hsl(var(--sera-warm-stone)/0.62)] bg-[hsl(var(--sera-matcha-mist)/0.28)] p-6 text-lg text-[hsl(var(--sera-ink-brown))]"
              >
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[hsl(var(--sera-warm-stone)/0.6)] bg-[hsl(var(--sera-ivory-paper)/0.76)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h3 className="sera-subheading text-4xl text-[hsl(var(--sera-ink-brown))] sm:text-5xl">Capabilities with hospitality at the center.</h3>
          <ul className="mt-10 grid gap-4">
            {capabilities.map((capability) => (
              <li
                key={capability}
                className="rounded-2xl border border-[hsl(var(--sera-warm-stone)/0.6)] bg-[hsl(var(--sera-ivory-paper))] px-6 py-4 text-[hsl(var(--sera-ink-brown)/0.82)]"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl rounded-[2rem] border border-[hsl(var(--sera-warm-stone)/0.66)] bg-[hsl(var(--sera-porcelain-rose)/0.58)] px-8 py-16 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">Host with intention.</p>
          <h3 className="sera-subheading mt-3 text-4xl text-[hsl(var(--sera-ink-brown))] sm:text-5xl">Begin with a quieter kind of confidence.</h3>
          <p className="mx-auto mt-5 max-w-xl text-[hsl(var(--sera-ink-brown)/0.76)]">
            Join a private circle of hosts creating thoughtful gatherings with refined invitation, guest, and on-site flow.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="xl"
              className="rounded-full bg-[hsl(var(--sera-ink-brown))] px-8 text-[hsl(var(--sera-ivory-paper))] hover:bg-[hsl(var(--sera-ink-brown)/0.94)]"
            >
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="xl"
              className="rounded-full text-[hsl(var(--sera-ink-brown))] hover:bg-[hsl(var(--sera-soft-blush)/0.6)]"
            >
              <Link to="/login">Organizer login</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
