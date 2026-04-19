import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type BackgroundPaperShaderProps = {
  className?: string;
  intensity?: "soft" | "balanced";
};

export function BackgroundPaperShader({
  className,
  intensity = "soft",
}: BackgroundPaperShaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const animated = !shouldReduceMotion;
  const ambientOpacity = intensity === "balanced" ? "opacity-80" : "opacity-65";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(247,244,238,0.98)_0%,rgba(242,238,230,0.96)_38%,rgba(237,232,224,0.94)_62%,rgba(231,228,220,0.95)_100%)]" />

      <motion.div
        className={cn(
          "absolute -left-[22%] top-[-26%] h-[78%] w-[78%] rounded-full blur-3xl",
          "bg-[radial-gradient(circle,rgba(255,255,252,0.55)_0%,rgba(255,255,252,0.08)_58%,transparent_74%)]",
          ambientOpacity,
        )}
        animate={
          animated
            ? { x: [0, 28, 12, 0], y: [0, 16, 20, 0], scale: [1, 1.04, 1.01, 1] }
            : undefined
        }
        transition={{ duration: 34, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      <motion.div
        className={cn(
          "absolute -right-[18%] bottom-[-34%] h-[84%] w-[84%] rounded-full blur-3xl",
          "bg-[radial-gradient(circle,rgba(151,118,117,0.18)_0%,rgba(131,133,117,0.12)_48%,rgba(131,133,117,0.05)_62%,transparent_78%)]",
          intensity === "balanced" ? "opacity-65" : "opacity-55",
        )}
        animate={
          animated
            ? { x: [0, -22, -10, 0], y: [0, -14, -10, 0], scale: [1, 1.03, 1.01, 1] }
            : undefined
        }
        transition={{ duration: 42, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-[-10%] top-[6%] h-[52%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.08)_52%,transparent_82%)]"
        animate={animated ? { opacity: [0.42, 0.58, 0.46, 0.42] } : undefined}
        transition={{ duration: 24, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.36)_0%,transparent_40%),radial-gradient(circle_at_78%_26%,rgba(126,132,121,0.08)_0%,transparent_42%)] mix-blend-soft-light" />

      <div className="absolute inset-0 opacity-[0.18] mix-blend-multiply [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.22%22/%3E%3C/svg%3E')]" />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,238,0.02)_0%,rgba(247,244,238,0.22)_72%,rgba(246,241,233,0.45)_100%)]" />
    </div>
  );
}
