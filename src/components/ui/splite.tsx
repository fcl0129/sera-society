"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SpliteProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  scene: string;
  title?: string;
}

const Splite = React.forwardRef<HTMLIFrameElement, SpliteProps>(
  ({ className, scene, title = "Spline Scene", allow, ...props }, ref) => (
    <iframe
      ref={ref}
      title={title}
      src={scene}
      className={cn("h-full w-full border-0", className)}
      allow={allow ?? "fullscreen"}
      loading={props.loading ?? "lazy"}
      {...props}
    />
  ),
);

Splite.displayName = "Splite";

export { Splite };
