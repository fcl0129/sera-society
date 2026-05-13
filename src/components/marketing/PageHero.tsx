import type { CSSProperties, ReactNode } from "react";

const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%25%23n)'/></svg>")`;

type Props = {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  children?: ReactNode;
};

export default function PageHero({ eyebrow, title, lede, children }: Props) {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "180px 40px 88px" }}>
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(circle at 16% 18%, rgba(90,18,24,0.32), transparent 38%),
            radial-gradient(circle at 86% 26%, rgba(169,132,92,0.18), transparent 36%),
            linear-gradient(180deg, #071426 0%, #0D1B2E 100%)
          `,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, opacity: 0.06,
          mixBlendMode: "overlay", pointerEvents: "none",
          backgroundImage: grain,
        }}
      />

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <span style={{ width: 28, height: 1, background: "var(--mkt-brass)" }} />
          <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>{eyebrow}</span>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)", fontWeight: 500,
            fontSize: "clamp(3rem,7vw,6.2rem)", lineHeight: 0.88,
            letterSpacing: "-0.05em", color: "var(--mkt-cream)",
            textWrap: "balance" as CSSProperties["textWrap"],
            maxWidth: 1000,
          }}
        >
          {title}
        </h1>

        {lede && (
          <p
            style={{
              margin: "32px 0 0", maxWidth: 580,
              fontFamily: "var(--font-sans)", fontSize: "1.1rem",
              lineHeight: 1.6, color: "var(--mkt-smoke)",
              textWrap: "pretty" as CSSProperties["textWrap"],
            }}
          >
            {lede}
          </p>
        )}

        {children && <div style={{ marginTop: 32 }}>{children}</div>}
      </div>
    </section>
  );
}
