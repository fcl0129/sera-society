import { useRef, useState, useEffect, CSSProperties } from "react";
import { Link } from "react-router-dom";
import MktLayout from "@/components/marketing/MktLayout";
import { PhoneMockup, ScenePhone } from "@/components/marketing/PhoneMockup";
import SectionTransition from "@/components/marketing/SectionTransition";
import ProductDemos, { FinalProductCTA } from "@/components/marketing/ProductDemos";

// ── Helpers ──────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function useScrollProgress(ref: React.RefObject<HTMLElement>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setP(Math.max(0, Math.min(1, scrolled / total)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);
  return p;
}

type SceneName = "invite" | "redeem" | "nfc";

function mapToScene(p: number): { scene: SceneName; phase: number; kicker: string; caption: string } {
  if (p < 0.33) {
    return {
      scene: "invite",
      phase: Math.min(3, Math.floor((p / 0.33) * 4)),
      kicker: "The cover arrives",
      caption: "An invitation that reads like the host's own voice — never a form.",
    };
  }
  if (p < 0.66) {
    return {
      scene: "redeem",
      phase: Math.min(3, Math.floor(((p - 0.33) / 0.33) * 4)),
      kicker: "One pour, held in hand",
      caption: "A drink ticket lives in the wallet, redeemed without a queue or a paper stub.",
    };
  }
  return {
    scene: "nfc",
    phase: Math.min(3, Math.floor(((p - 0.66) / 0.34) * 4)),
    kicker: "At the door, quietly",
    caption: "NFC and QR, side by side. Pacing held, atmosphere intact.",
  };
}

// ── ScrollHero ───────────────────────────────────────────────────────────────
function ScrollHero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>);
  const { scene, phase, kicker, caption } = mapToScene(progress);

  // Zoom curve: phone starts at ~0.55x, reaches full size by 35% scroll, then holds.
  const zoom = lerp(0.55, 1, Math.min(1, progress / 0.35));
  const textFade = Math.max(0, 1 - progress / 0.28);
  const textLift = -progress * 80;

  return (
    <section
      ref={ref}
      style={{
        height: "400vh",
        position: "relative",
        background: "var(--mkt-navy)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          background: "var(--mkt-navy)",
        }}
      >
        {/* Main stage */}
        <div
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            padding: "84px clamp(20px, 5vw, 56px) 0",
            display: "grid",
            alignItems: "center",
            gap: 32,
            boxSizing: "border-box",
          }}
          className="md:!grid-cols-[1.05fr_0.95fr] !grid-cols-1"
        >
          {/* Left — text */}
          <div
            style={{
              opacity: textFade,
              transform: `translateY(${textLift}px)`,
              transition: "opacity 120ms linear",
              willChange: "opacity, transform",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <span style={{ width: 28, height: 1, background: "var(--mkt-brass)" }} />
              <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>
                Sera Society · Editorial Hosting System
              </span>
            </div>

            <h1
              style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
                fontSize: "clamp(2.4rem,9vw,6.4rem)", lineHeight: 0.92,
                letterSpacing: "-0.05em", color: "var(--mkt-cream)",
                textWrap: "balance" as CSSProperties["textWrap"],
              }}
            >
              Host <span style={{ fontStyle: "italic" }}>beautifully</span>.<br />
              Run <span style={{ color: "var(--mkt-rouge)", transition: "color 320ms" }}>everything</span>.
            </h1>

            <p
              style={{
                margin: "24px 0 0", maxWidth: 520,
                fontFamily: "var(--font-sans)", fontSize: "1rem",
                lineHeight: 1.6, color: "var(--mkt-smoke)",
                textWrap: "pretty" as CSSProperties["textWrap"],
              }}
            >
              A private event platform for invitations, guest lists, RSVP, check-in
              and the details that make a night feel effortless.
            </p>

            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
              <Link to="/platform" className="mkt-btn mkt-btn--ghost-dark">Step inside</Link>
            </div>
          </div>

          {/* Right — phone (zooms in on scroll) */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 80ms linear",
                willChange: "transform",
              }}
            >
              <ScenePhone scene={scene} phase={phase} width={260} />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        {progress < 0.04 && (
          <div
            style={{
              position: "absolute", bottom: 28, left: 0, right: 0,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              color: "var(--mkt-brass)", opacity: 0.8,
              animation: "mkt-bobble 2.4s ease-in-out infinite",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.32em", textTransform: "uppercase" }}>
              Scroll · the night unfolds
            </span>
            <svg width="14" height="22" viewBox="0 0 14 22" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="0.5" y="0.5" width="13" height="21" rx="6.5" />
              <line x1="7" y1="5" x2="7" y2="9" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Showcase ─────────────────────────────────────────────────────────────────
function Showcase() {
  const items = [
    { key: "invite" as const, label: "01 — Invitation arrives", copy: "RSVP in two taps. Plus-ones, dietary notes, dress code — all on one page." },
    { key: "redeem" as const, label: "02 — Tap to redeem", copy: "One pour, held in the wallet. The bartender sees it as it lands." },
    { key: "nfc" as const,    label: "03 — NFC at the door", copy: "Pass the phone over the reader. Pacing held; atmosphere intact." },
  ];

  return (
    <section
      style={{
        background: "var(--mkt-navy)",
        padding: "120px 40px",
        borderTop: "1px solid var(--mkt-brass-30)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(244,235,221,0.04), transparent 70%)" }} />

      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 64 }}>
          <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>Sera, in use</span>
          <h2
            style={{
              margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
              fontSize: "clamp(2rem,4.6vw,4.2rem)", lineHeight: 0.96,
              letterSpacing: "-0.04em", color: "var(--mkt-cream)",
              textWrap: "balance" as CSSProperties["textWrap"],
            }}
          >
            From the <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>cover</span> to
            the door — <span style={{ fontStyle: "italic" }}>and</span> the bar.
          </h2>
          <p style={{ margin: "20px 0 0", maxWidth: 540, fontFamily: "var(--font-sans)", fontSize: "1rem", lineHeight: 1.6, color: "var(--mkt-smoke)" }}>
            Three moments your guest moves through, each held in one calm interface.
          </p>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 48, alignItems: "start" }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {items.map((m) => (
            <div key={m.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
              <PhoneMockup scene={m.key} playing width={240} />
              <div style={{ maxWidth: 320, textAlign: "center" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
                  {m.label}
                </p>
                <p style={{ margin: "12px 0 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.45, color: "var(--mkt-cream)", opacity: 0.86 }}>
                  {m.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Manifesto ────────────────────────────────────────────────────────────────
function Manifesto() {
  const lines = [
    "Curate the room before you open the door.",
    "An invitation is direction, not distribution.",
    "The crowd should feel inevitable, never accidental.",
  ];
  return (
    <section style={{ position: "relative", background: "var(--mkt-cream)", padding: "120px 40px" }}>
      <div
        style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 64 }}
        className="block md:grid"
      >
        <div>
          <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>Manifesto</span>
          <p style={{ marginTop: 12, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.5, color: "rgba(18,16,14,0.7)", maxWidth: 280 }}>
            Three rules we live by. They predate any feature in the platform.
          </p>
        </div>
        <div style={{ borderLeft: "1px solid var(--mkt-brass-30)", paddingLeft: 40 }}>
          {lines.map((line, i) => (
            <p
              key={line}
              style={{
                margin: i === lines.length - 1 ? 0 : "0 0 28px",
                marginLeft: i === 1 ? 56 : 0,
                fontFamily: "var(--font-display)", fontWeight: 500,
                fontSize: "clamp(2rem,4.4vw,4rem)", lineHeight: 0.92,
                letterSpacing: "-0.035em", color: "var(--mkt-navy)",
                textWrap: "balance" as CSSProperties["textWrap"],
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Full-bleed quote ─────────────────────────────────────────────────────────
function FullBleedQuote() {
  return (
    <section
      style={{
        background: "var(--mkt-navy)", padding: "120px 40px",
        borderTop: "1px solid var(--mkt-brass-30)",
        borderBottom: "1px solid var(--mkt-brass-30)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(90,18,24,0.18), transparent 70%)" }} />
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <p
          style={{
            margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
            fontSize: "clamp(2.4rem,8vw,7.4rem)", lineHeight: 0.87,
            letterSpacing: "-0.05em", color: "var(--mkt-cream)",
            textWrap: "balance" as CSSProperties["textWrap"],
          }}
        >
          If everyone can enter, <br />
          <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>no one</span> feels invited.
        </p>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index() {
  return (
    <MktLayout>
      <ScrollHero />
      <Showcase />
      <SectionTransition from="navy" to="cream" />
      <ProductDemos />
      <SectionTransition from="navy" to="cream" />
      <Manifesto />
      <SectionTransition from="cream" to="navy" />
      <FullBleedQuote />
      <SectionTransition from="navy" to="cream" />
      <FinalProductCTA />
    </MktLayout>
  );
}
