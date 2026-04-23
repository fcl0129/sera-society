import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { AmbientBackground } from "@/components/sera/ambient-background";
import { SiteHeader } from "@/components/sera/site-header";

const sections = [
  {
    label: "Before the evening",
    title: "Set expectation before the first arrival.",
    copy: "From the first note to final confirmation, every touchpoint carries the same tone so guests arrive already in rhythm.",
  },
  {
    label: "At the door",
    title: "A calm entrance changes the room.",
    copy: "Approvals, list flow, and service cues stay precise and discreet, so welcome feels personal even at peak pace.",
  },
  {
    label: "Through the night",
    title: "Control the pace without showing control.",
    copy: "Keep the evening moving with quiet precision while atmosphere, conversation, and timing remain uninterrupted.",
  },
] as const;

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Index() {
  return (
    <AmbientBackground className="min-h-screen">
      <SiteHeader />
      <motion.main
        id="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 pb-28 pt-32 md:px-10 md:pb-36 md:pt-44"
      >
        <section className="mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.03 }}
            className="max-w-xl text-[0.66rem] uppercase tracking-[0.3em] text-[#decfbf]/76"
          >
            Sera Society · Private Event Hosting
          </motion.p>
          {/* Hero headline options:
            1) Host something worth remembering.
            2) Nothing memorable is ever accidental.
            3) Details make the evening.
            4) Some events deserve more than planning.
            5) The night should feel considered from the first word.
          */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-5xl font-display text-[clamp(3rem,8.2vw,7.1rem)] leading-[0.88] tracking-[-0.026em] text-[#f4eadb]"
          >
            Nothing memorable is ever accidental.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.14 }}
            className="mt-8 max-w-xl text-[1.02rem] leading-[1.72] text-[#d8ccbc] md:ml-16 md:text-[1.1rem]"
          >
            Invitations, guests, and details — handled with intention.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.18 }}
            className="mt-11 flex flex-wrap gap-3 md:ml-16"
          >
            <Link to="/request-access" className="sera-landing-btn sera-landing-btn--primary">
              Request access
            </Link>
            <Link to="/platform" className="sera-landing-btn sera-landing-btn--secondary">
              View the experience
            </Link>
          </motion.div>
        </section>

        <motion.section {...sectionMotion} className="mx-auto mt-28 max-w-6xl border-y border-[#eadbc8]/14 py-20 md:mt-32 md:py-24">
          <div className="grid gap-14 md:gap-10">
            {sections.map((section) => (
              <article key={section.label} className="grid gap-4 md:grid-cols-[0.24fr_1fr] md:gap-10">
                <p className="pt-1 text-[0.63rem] uppercase tracking-[0.28em] text-[#d8cab9]/65">{section.label}</p>
                <div className="space-y-4">
                  <h2 className="max-w-3xl font-display text-[clamp(1.95rem,4.5vw,3.8rem)] leading-[0.93] tracking-[-0.02em] text-[#eee4d5]">
                    {section.title}
                  </h2>
                  <p className="max-w-2xl text-[0.98rem] leading-[1.76] text-[#d3c6b5] md:text-[1.04rem]">{section.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section {...sectionMotion} className="mx-auto mt-24 max-w-6xl md:mt-28">
          <div className="grid gap-8 border-t border-[#e3d4bf]/22 pt-11 md:grid-cols-[1.18fr_auto] md:items-end md:gap-12">
            <h2 className="max-w-4xl font-display text-[clamp(2.2rem,5.6vw,5rem)] leading-[0.9] tracking-[-0.024em] text-[#2b221f]">
              Built for evenings that matter, and hosts who notice every detail.
            </h2>
            <Link to="/contact" className="sera-landing-btn sera-landing-btn--tertiary self-start md:self-auto">
              Speak with our team
            </Link>
          </div>
        </motion.section>
      </motion.main>
    </AmbientBackground>
  );
}
