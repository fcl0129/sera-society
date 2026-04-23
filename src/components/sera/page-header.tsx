import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type SeraPageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SeraPageHeader({ title, description, className }: SeraPageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("space-y-5", className)}
    >
      <h1 className="font-display text-[clamp(2.2rem,6vw,4.8rem)] leading-[0.9] tracking-[-0.024em] text-[#f2e7d8]">{title}</h1>
      {description ? <p className="max-w-3xl text-[1rem] leading-[1.8] text-[#d9cebf] md:text-[1.08rem]">{description}</p> : null}
    </motion.header>
  );
}
