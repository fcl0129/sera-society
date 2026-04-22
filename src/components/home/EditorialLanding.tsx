import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const manifesto = [
  "Curate the room before you open the door.",
  "An invitation is direction, not distribution.",
  "The crowd should feel inevitable, never accidental.",
] as const;

const moments = [
  {
    label: "INVITATION",
    headline: "Every detail should imply who belongs.",
    copy: "Shape first impression through language, pacing, and restraint. No template energy. No generic call-to-action noise.",
  },
  {
    label: "GUEST LIST",
    headline: "Build selective gravity.",
    copy: "Approve, tier, and hold with intent so the room arrives in cadence—never in chaos.",
  },
  {
    label: "AT THE DOOR",
    headline: "Operations that stay invisible.",
    copy: "Fast check-in and redemption without breaking atmosphere. The system handles pressure while you hold tone.",
  },
] as const;

export default function EditorialLanding() {
  return (
    <div className="landing-editorial relative overflow-hidden bg-sera-paper text-sera-ink">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-sera-rose/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-[34rem] h-96 w-96 rounded-full bg-sera-moss/20 blur-3xl" />

      <main id="main-content" className="relative pb-32 pt-32 md:pt-40">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-sm text-[0.68rem] uppercase tracking-[0.26em] text-sera-moss"
          >
            Sera Society · Editorial Hosting System
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-5xl font-display text-[clamp(3.4rem,10vw,8.8rem)] leading-[0.86] tracking-[-0.026em]"
          >
            Set the tone so precisely the night introduces itself.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-sera-ink/74 md:ml-24"
          >
            Sera Society is built for hosts who design atmosphere first, then let logistics disappear behind it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap gap-3 md:ml-24"
          >
            <Link to="/request-access" className="sera-pill sera-pill--ink">
              Request access
            </Link>
            <Link to="/platform" className="sera-pill sera-pill--line">
              View platform
            </Link>
          </motion.div>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 md:grid-cols-[1fr_1.2fr] md:items-start">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sera-moss md:pt-5">Manifesto</p>
            <div className="space-y-8 border-l border-sera-line/70 pl-6 md:pl-10">
              {manifesto.map((line, index) => (
                <p
                  key={line}
                  className="max-w-3xl font-display text-[clamp(2rem,4.8vw,4.5rem)] leading-[0.9]"
                  style={{ marginLeft: index % 2 === 0 ? 0 : "2.5rem" }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 border-y border-sera-line/70 bg-sera-ink py-24 text-sera-cloud md:py-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-6xl px-6 font-display text-[clamp(2.4rem,8vw,7.4rem)] leading-[0.87] md:px-10"
          >
            If everyone can enter, no one feels invited.
          </motion.p>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-6 md:px-10">
          <div className="space-y-16">
            {moments.map((moment, index) => (
              <article
                key={moment.label}
                className={`grid gap-6 border-t border-sera-line/60 pt-8 md:grid-cols-[0.35fr_1fr] ${index % 2 ? "md:pl-16" : ""}`}
              >
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-sera-moss">{moment.label}</p>
                <div className="space-y-4">
                  <h2 className="max-w-4xl font-display text-[clamp(2.1rem,5vw,4.8rem)] leading-[0.9] tracking-[-0.018em]">
                    {moment.headline}
                  </h2>
                  <p className="max-w-2xl text-base leading-relaxed text-sera-ink/72 md:text-lg">{moment.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-7xl px-6 md:px-10">
          <div className="grid gap-8 border-t border-sera-line/70 pt-10 md:grid-cols-[1.1fr_auto] md:items-end">
            <h2 className="max-w-4xl font-display text-[clamp(2.4rem,6.2vw,5.8rem)] leading-[0.88] tracking-[-0.02em]">
              Build a night that reads like a private publication, not a public listing.
            </h2>
            <Link to="/login" className="sera-pill sera-pill--line self-start md:self-auto">
              Organizer login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
