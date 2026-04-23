import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AmbientBackgroundProps = {
  className?: string;
  children: ReactNode;
};

export function AmbientBackground({ className, children }: AmbientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-[linear-gradient(180deg,#08101d_0%,#0d1625_18%,#141728_36%,#211a28_52%,#3a2a2d_66%,#cab8a4_84%,#ede2d2_100%)] text-[#f3ede5]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[-24%] top-[-28rem] h-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(86,112,152,0.32),rgba(9,16,27,0)_68%)] blur-3xl" />
        <div className="absolute left-[-18%] top-[12rem] h-[26rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(109,39,48,0.24),rgba(36,27,33,0)_74%)] blur-[120px]" />
        <div className="absolute right-[-16%] top-[20rem] h-[24rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(56,66,87,0.3),rgba(17,23,34,0)_70%)] blur-[110px]" />
        <div className="absolute inset-x-0 bottom-[-14rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,rgba(246,236,222,0.88),rgba(237,226,210,0)_70%)]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
