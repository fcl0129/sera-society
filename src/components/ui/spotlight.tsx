import * as React from "react";

import { cn } from "@/lib/utils";

export interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  fill?: string;
}

const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
  ({ className, fill = "white", style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]",
        className,
      )}
      style={{
        background: `radial-gradient(600px circle at center, ${fill} 0%, transparent 55%)`,
        ...style,
      }}
      {...props}
    />
  ),
);

Spotlight.displayName = "Spotlight";

export { Spotlight };
