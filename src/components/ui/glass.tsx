import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glassVariants = cva(
  "relative isolate overflow-hidden rounded-xl border text-foreground backdrop-blur-md transition-all before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
  {
    variants: {
      strength: {
        light:
          "border-white/15 bg-white/[0.04] shadow-[0_1px_1px_rgba(15,23,42,0.18),0_10px_26px_rgba(15,23,42,0.12)]",
        default:
          "border-white/20 bg-white/[0.06] shadow-[0_1px_1px_rgba(15,23,42,0.24),0_14px_34px_rgba(15,23,42,0.16)]",
        strong:
          "border-white/25 bg-white/[0.1] shadow-[0_1px_1px_rgba(15,23,42,0.28),0_18px_44px_rgba(15,23,42,0.2)]",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.1] hover:shadow-[0_2px_2px_rgba(15,23,42,0.2),0_20px_42px_rgba(15,23,42,0.22)]",
        false: "",
      },
      glow: {
        true: "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-white/10 after:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_36px_rgba(147,197,253,0.2)]",
        false: "",
      },
    },
    defaultVariants: {
      strength: "default",
      interactive: false,
      glow: false,
    },
  },
);

export interface GlassProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof glassVariants> {}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ className, strength, interactive, glow, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(glassVariants({ strength, interactive, glow }), className)} {...props}>
        {children}
      </div>
    );
  },
);
Glass.displayName = "Glass";

export { Glass, glassVariants };
