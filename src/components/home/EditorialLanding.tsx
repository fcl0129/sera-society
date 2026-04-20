import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ruleLines = [
  "Not everyone should come.",
  "Make it harder to get invited.",
  "You're not planning an event.",
  "You're setting a tone.",
] as const;

const productHints = [
  {
    kicker: "01 · INVITE",
    title: "Signal, not spam.",
    body: "Drop a link that already feels like the night has started.",
    className: "lg:col-span-4 lg:row-span-2 lg:-mt-10",
  },
  {
    kicker: "02 · GUEST LIST",
    title: "Control the room.",
    body: "Tier, hold, approve, and move names without chaos.",
    className: "lg:col-span-3 lg:ml-8",
  },
  {
    kicker: "03 · EVENT PAGE",
    title: "One page. Total mood.",
    body: "Everything guests need, none of the stale template energy.",
    className: "lg:col-span-5 lg:-ml-6",
  },
  {
    kicker: "04 · DOOR FLOW",
    title: "Fast at the door.",
    body: "Check-in that feels deliberate, not frantic.",
    className: "lg:col-span-4 lg:-mt-14 lg:ml-16",
  },
] as const;

export default function EditorialLanding() {
  return (
    <div className="relative overflow-hidden bg-sera-paper text-sera-ink">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-sera-rose/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-[34rem] h-[28rem] w-[28rem] rounded-full bg-sera-moss/20 blur-3xl" />

      <main id="main-content" className="relative pb-24 pt-28 md:pt-36">
        <section className="mx-auto grid max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7"
          >
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.24em] text-sera-moss">Sera Society</p>
            <h1 className="max-w-4xl font-display text-[clamp(3.2rem,9.5vw,8.1rem)] leading-[0.9] tracking-[-0.02em]">
              The room should hit before the music does.
            </h1>
            <p className="max-w-lg font-sans text-lg leading-relaxed text-sera-ink/75">
              For hosts who would rather break pattern than repeat one.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/request-access"
                className="rounded-full bg-sera-ink px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-sera-cloud transition hover:-translate-y-0.5 hover:bg-sera-ink/90"
              >
                Start the list
              </Link>
              <Link
                to="/platform"
                className="rounded-full border border-sera-line bg-sera-cloud/70 px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:border-sera-ink"
              >
                See the system
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mt-6 border-l border-sera-line pl-6 lg:mt-20 lg:pl-8"
          >
            <p className="font-sans text-[0.66rem] uppercase tracking-[0.2em] text-sera-moss">Disruption Brief</p>
            <div className="mt-5 space-y-4">
              {ruleLines.map((line, index) => (
                <p
                  key={line}
                  className="font-display text-3xl leading-[1.02] tracking-display text-sera-ink sm:text-4xl"
                  style={{ marginLeft: `${index % 2 === 0 ? 0 : 28}px` }}
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-20 border-y border-sera-line bg-sera-ink px-6 py-20 text-sera-cloud md:px-10 md:py-28">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-6xl font-display text-[clamp(2.4rem,8.2vw,7.2rem)] leading-[0.88]"
          >
            If the invite could belong to anyone, it belongs to no one.
          </motion.p>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-6 md:px-10">
          <div className="mb-12 max-w-2xl">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.23em] text-sera-moss">What you actually need</p>
            <h2 className="mt-4 font-display text-5xl leading-[0.92] tracking-display sm:text-6xl">Tools with attitude.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-10 lg:grid-rows-3">
            {productHints.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className={`rounded-[1.6rem] border border-sera-line bg-sera-cloud/75 p-6 shadow-sera-soft backdrop-blur-sm ${item.className}`}
              >
                <p className="font-sans text-[0.66rem] uppercase tracking-[0.2em] text-sera-moss">{item.kicker}</p>
                <h3 className="mt-4 font-display text-3xl tracking-display">{item.title}</h3>
                <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-sera-ink/75">{item.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-6 md:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <p className="font-sans text-xs uppercase tracking-[0.23em] text-sera-moss">Final warning</p>
            <h2 className="font-display text-[clamp(2.2rem,6.3vw,5.3rem)] leading-[0.9] tracking-[-0.015em] lg:-ml-8">
              Good events fill seats. Great ones edit the room.
            </h2>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-10">
          <div className="relative overflow-hidden rounded-[2.2rem] border border-sera-line bg-sera-blush/55 px-7 py-12 md:px-12 md:py-16">
            <div className="absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-sera-ink/20" />
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="font-sans text-[0.68rem] uppercase tracking-[0.24em] text-sera-moss">Build the night</p>
                <h3 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-display sm:text-5xl md:text-6xl">
                  Make it unmistakably yours.
                </h3>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row lg:flex-col">
                <Link
                  to="/request-access"
                  className="rounded-full bg-sera-ink px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-sera-cloud transition hover:-translate-y-0.5"
                >
                  Request access
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-sera-line bg-sera-cloud/80 px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em]"
                >
                  Organizer login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
