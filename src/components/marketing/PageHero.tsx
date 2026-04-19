import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  align?: "left" | "center";
  width?: "default" | "narrow";
}

const widthClassMap = {
  default: "max-w-4xl",
  narrow: "max-w-3xl",
} as const;

export default function PageHero({ eyebrow, title, description, align = "center", width = "default" }: PageHeroProps) {
  const isCentered = align === "center";

  return (
    <section className="sera-gradient-navy pb-20 pt-32">
      <div className={`mx-auto px-6 ${widthClassMap[width]} ${isCentered ? "text-center" : ""}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="sera-label mb-4 text-sera-stone">{eyebrow}</p>
          <h1 className="sera-heading mb-6 text-4xl text-sera-ivory md:text-6xl">{title}</h1>
          <p className={`sera-body text-lg text-sera-sand ${isCentered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>{description}</p>
        </motion.div>
      </div>
    </section>
  );
}
