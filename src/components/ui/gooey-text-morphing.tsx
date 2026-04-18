"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface GooeyTextMorphingProps extends React.HTMLAttributes<HTMLDivElement> {
  words: string[];
  interval?: number;
}

export function GooeyTextMorphing({
  words,
  interval = 2000,
  className,
  ...props
}: GooeyTextMorphingProps) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (words.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, words]);

  if (words.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="gooey-text-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative" style={{ filter: "url(#gooey-text-filter)" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.02 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="inline-block"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
