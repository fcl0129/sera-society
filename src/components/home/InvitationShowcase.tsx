import { motion } from "framer-motion";

const invitationExamples = [
  {
    id: "editorial",
    label: "Editorial Minimal",
    src: "/invite-mockups/editorial-minimal.svg",
    outputType: "Sera invite output",
    question: "Best for",
    detail: "Quiet typography and disciplined spacing for intimate, premium events.",
  },
  {
    id: "poster",
    label: "Dramatic Poster",
    src: "/invite-mockups/dramatic-poster.svg",
    outputType: "Sera flyer output",
    question: "Best for",
    detail: "High-contrast layouts built for nightlife launches and culture programs.",
  },
  {
    id: "formal",
    label: "Formal Gala",
    src: "/invite-mockups/formal-gala.svg",
    outputType: "Sera invite output",
    question: "Best for",
    detail: "Structured invitation systems for members clubs, dinners, and black-tie hosts.",
  },
];

export default function InvitationShowcase() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="sera-label mb-4 text-sera-oxblood">Invitation system</p>
          <h2 className="sera-heading text-3xl text-sera-ivory sm:text-4xl">Invitation outputs generated inside the Sera product workflow</h2>
          <p className="sera-body mt-4 text-sm text-sera-mist/80 sm:text-base">
            Every style below is a production-ready output from Sera templates, so pre-event communication
            stays aligned with the same system used for RSVP, check-in, and redemption.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {invitationExamples.map((item, i) => (
            <motion.article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-sera-mist/20 bg-sera-navy/70 shadow-[0_28px_70px_-44px_rgba(6,10,18,0.95)] transition-all duration-300 hover:border-sera-mist/35 hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <div className="relative">
                <img src={item.src} alt={item.label} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sera-charcoal/90 via-sera-charcoal/15 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center border border-sera-mist/30 bg-sera-charcoal/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-sera-mist/90 backdrop-blur-sm">
                  {item.outputType}
                </span>
              </div>
              <div className="p-5">
                <p className="sera-label text-sera-mist/70">{item.question}</p>
                <h3 className="sera-subheading mt-2 text-xl text-sera-ivory">{item.label}</h3>
                <p className="sera-body mt-2 text-sm text-sera-mist/80">{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
