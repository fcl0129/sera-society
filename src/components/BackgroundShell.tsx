import type { ReactNode } from "react";

export default function BackgroundShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050814] text-sera-ivory">
      {/* Cinematic overlays (subtle) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(120,140,255,0.10),transparent_60%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_0%_40%,rgba(255,255,255,0.06),transparent_55%)] opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_100%_65%,rgba(255,255,255,0.05),transparent_55%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(1400px_900px_at_50%_55%,transparent_55%,rgba(0,0,0,0.55))] opacity-70" />
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}
