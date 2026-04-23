import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SeraSectionProps = {
  children: ReactNode;
  className?: string;
  spacing?: "tight" | "default" | "large";
};

const spacingClasses = {
  tight: "py-8 md:py-10",
  default: "py-12 md:py-16",
  large: "py-16 md:py-24",
} as const;

export function SeraSection({ children, className, spacing = "default" }: SeraSectionProps) {
  return <section className={cn(spacingClasses[spacing], className)}>{children}</section>;
}
