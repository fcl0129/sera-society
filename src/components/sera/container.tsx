import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SeraContainerProps = {
  children: ReactNode;
  className?: string;
};

export function SeraContainer({ children, className }: SeraContainerProps) {
  return <div className={cn("mx-auto w-full max-w-5xl px-6 md:px-10", className)}>{children}</div>;
}
