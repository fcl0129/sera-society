import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import { AmbientBackground } from "@/components/sera/ambient-background";
import { SiteHeader } from "@/components/sera/site-header";
import { cn } from "@/lib/utils";

type SeraLayoutProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  showFooter?: boolean;
};

export function SeraLayout({ children, className, mainClassName, showFooter = true }: SeraLayoutProps) {
  return (
    <AmbientBackground className={cn("min-h-screen", className)}>
      <SiteHeader />
      <main id="main-content" className={cn("px-2 pb-20 pt-28 md:pb-28 md:pt-36", mainClassName)}>
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </AmbientBackground>
  );
}
