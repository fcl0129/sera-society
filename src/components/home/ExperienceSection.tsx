import { motion } from "framer-motion";

const stages = [
  {
    step: "01",
    title: "Define the event",
    detail: "Set format, capacity, and guest intent before outreach starts.",
  },
  {
    step: "02",
    title: "Publish one branded journey",
    detail: "Invites, event page, and RSVP all run from the same narrative layer.",
  },
  {
    step: "03",
    title: "Operate in real time",
    detail: "Check-in, access, and redemption update live so teams stay coordinated.",
  },
];

export default function ExperienceSection() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center md:mb-14"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="sera-label mb-4 text-sera-stone/90">What is Sera?</p>
          <h2 className="sera-heading text-3xl text-sera-navy sm:text-4xl">
            The guest system for design-led events
          </h2>
          <p className="sera-body mt-4 text-sm text-sera-stone sm:text-base">
            Sera Society unifies invitation design and on-site execution so hosts can run a single,
            high-standard experience instead of stitching together separate tools.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {stages.map((stage, i) => (
            <motion.article
              key={stage.step}
              className="rounded-2xl border border-white/55 bg-white/72 p-5 shadow-[0_16px_38px_-30px_rgba(8,14,28,0.8)] sm:p-6"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <p className="sera-label text-sera-oxblood/95">Step {stage.step}</p>
              <h3 className="sera-subheading mt-2 text-xl text-sera-navy">{stage.title}</h3>
              <p className="sera-body mt-2 text-sm text-sera-ink/85">{stage.detail}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
