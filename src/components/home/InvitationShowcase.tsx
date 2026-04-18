import { motion } from "framer-motion";

const invitationExamples = [
  {
    id: "editorial",
    label: "Editorial Minimal",
    src: "/invite-mockups/editorial-minimal.svg",
    question: "How it looks",
    detail: "Quiet typography and disciplined spacing for intimate, premium events.",
  },
  {
    id: "poster",
    label: "Dramatic Poster",
    src: "/invite-mockups/dramatic-poster.svg",
    question: "How it looks",
    detail: "High-contrast layouts built for nightlife launches and culture programs.",
  },
  {
    id: "formal",
    label: "Formal Gala",
    src: "/invite-mockups/formal-gala.svg",
    question: "Who it is for",
    detail: "Structured invitation systems for members clubs, dinners, and black-tie hosts.",
  },
];

export default function InvitationShowcase() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="sera-label mb-4 text-sera-stone">Visual direction</p>
          <h2 className="sera-heading text-3xl text-sera-navy sm:text-4xl">Design language that stays consistent at every touchpoint</h2>
          <p className="sera-body mt-4 text-sm text-sera-warm-grey sm:text-base">
            Invitation styles are intentional presets, not disconnected templates, so the pre-event
            brand expression matches the live event experience.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {invitationExamples.map((item, i) => (
            <motion.article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-white/30 bg-white/45 backdrop-blur-md"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <img src={item.src} alt={item.label} className="aspect-[3/4] w-full object-cover" loading="lazy" />
              <div className="p-5">
                <p className="sera-label text-sera-stone">{item.question}</p>
                <h3 className="sera-subheading mt-2 text-xl text-sera-navy">{item.label}</h3>
                <p className="sera-body mt-2 text-sm text-sera-warm-grey">{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
