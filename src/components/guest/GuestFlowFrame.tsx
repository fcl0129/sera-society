import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GuestFlowFrameProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
}

export default function GuestFlowFrame({ eyebrow, title, description, children }: GuestFlowFrameProps) {
  return (
    <section className="min-h-screen bg-sera-surface-light py-20 md:py-28">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <p className="sera-label text-sera-warm-grey">{eyebrow}</p>
          <h1 className="font-serif text-4xl leading-tight text-sera-navy md:text-6xl">{title}</h1>
          <p className="max-w-2xl text-base text-sera-warm-grey md:text-lg">{description}</p>
        </motion.div>

        {children}
      </div>
    </section>
  );
}
