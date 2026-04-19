import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva("rounded-lg border transition-[background-color,border-color,box-shadow] duration-base ease-standard", {
  variants: {
    tone: {
      base: "bg-card border-border shadow-soft",
      elevated: "bg-card border-border shadow-elevated",
      subtle: "bg-background border-border/70 shadow-none",
      warm: "bg-sera-surface-warm border-border shadow-soft",
      cool: "bg-sera-surface-cool border-border shadow-soft",
      glass: "bg-card/80 border-border/70 backdrop-blur-sm shadow-glass",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    tone: "base",
    padding: "md",
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(({ className, tone, padding, ...props }, ref) => {
  return <div ref={ref} className={cn(surfaceVariants({ tone, padding }), className)} {...props} />;
});
Surface.displayName = "Surface";

export { Surface, surfaceVariants };
