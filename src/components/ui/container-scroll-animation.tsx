"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ContainerScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  offset?: [string, string];
}

export function ContainerScrollAnimation({
  children,
  className,
  containerClassName,
  contentClassName,
  offset = ["start end", "end start"],
}: ContainerScrollAnimationProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset,
  });

  const y = useTransform(scrollYProgress, [0, 1], [48, -48]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1.04]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.4, 1, 0.85]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", containerClassName)}>
      <motion.div style={{ y, scale, opacity }} className={cn("will-change-transform", className)}>
        <div className={cn("relative", contentClassName)}>{children}</div>
      </motion.div>
    </div>
  );
}
