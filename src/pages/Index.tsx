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

const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%25%23n)'/></svg>")`;

// ── ScrollHero ───────────────────────────────────────────────────────────────
function ScrollHero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref as React.RefObject<HTMLElement>);
  const { scene, phase, kicker, caption } = mapToScene(progress);

  return (
    <section ref={ref} style={{ height: "400vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* Background */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(circle at 18% 12%, rgba(90,18,24,0.34), transparent 38%),
              radial-gradient(circle at 84% 22%, rgba(169,132,92,0.20), transparent 32%),
              radial-gradient(circle at 50% 110%, rgba(13,27,46,0.6), transparent 60%),
              linear-gradient(180deg, #071426 0%, #0D1B2E 60%, #0a1422 100%)
            `,
          }}
        />
        {/* Film grain */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, opacity: 0.1,
            mixBlendMode: "overlay", pointerEvents: "none",
            backgroundImage: grain,
          }}
        />

        {/* Progress rail */}
        <div
          style={{
            position: "absolute", right: 24, top: 96, bottom: 96,
            width: 1, background: "var(--mkt-brass-30)",
          }}
        >
          <div
            style={{
              position: "absolute", left: -3, top: `${progress * 100}%`,
              width: 7, height: 7, borderRadius: 999,
              background: "var(--mkt-brass)",
              transform: "translateY(-50%)",
              boxShadow: "0 0 0 1px rgba(7,20,38,0.6)",
              transition: "top 80ms linear",
            }}
          />
          <div
            style={{
              position: "absolute", left: 14, top: `${progress * 100}%`,
              transform: "translateY(-50%)",
              fontFamily: "var(--font-mono)", fontSize: "0.56rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--mkt-brass)", whiteSpace: "nowrap",
            }}
          >
            {scene.toUpperCase()} · {Math.round(progress * 100).toString().padStart(2, "0")}
          </div>
        </div>

        {/* Main stage */}
        <div
          style={{
            position: "relative", height: "100%",
            maxWidth: 1280, margin: "0 auto", padding: "84px 64px 0 40px",
            display: "grid", gridTemplateColumns: "1.05fr 0.95fr",
            alignItems: "center", gap: 56,
          }}
          className="block md:grid"
        >
          {/* Left — text */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <span style={{ width: 28, height: 1, background: "var(--mkt-brass)" }} />
              <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>
                Sera Society · Editorial Hosting System
              </span>
            </div>

            <h1
              style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
                fontSize: "clamp(3rem,6.4vw,6.4rem)", lineHeight: 0.88,
                letterSpacing: "-0.05em", color: "var(--mkt-cream)",
                textWrap: "balance" as CSSProperties["textWrap"],
              }}
            >
              Host <span style={{ fontStyle: "italic" }}>beautifully</span>.<br />
              Run <span style={{ color: "var(--mkt-rouge)", transition: "color 320ms" }}>everything</span>.
            </h1>

            <p
              style={{
                margin: "32px 0 0", maxWidth: 520,
                fontFamily: "var(--font-sans)", fontSize: "1.05rem",
                lineHeight: 1.6, color: "var(--mkt-smoke)",
                textWrap: "pretty" as CSSProperties["textWrap"],
              }}
            >
              A private event platform for invitations, guest lists, RSVP, check-in
              and the details that make a night feel effortless.
            </p>

            {/* Live caption */}
            <div style={{ marginTop: 40, paddingTop: 22, borderTop: "1px solid var(--mkt-brass-30)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--mkt-brass)", letterSpacing: "0.18em" }}>
                  {scene === "invite" ? "01" : scene === "redeem" ? "02" : "03"} / 03
                </span>
                <span style={{ width: 24, height: 1, background: "var(--mkt-brass-30)" }} />
                <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>{kicker}</span>
              </div>
              <p
                key={kicker}
                style={{
                  margin: "16px 0 0", maxWidth: 460,
                  fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500,
                  fontSize: "1.7rem", lineHeight: 1.15, letterSpacing: "-0.02em",
                  color: "var(--mkt-cream)",
                  animation: "mkt-caption-in 600ms cubic-bezier(0.22,1,0.36,1) both",
                }}
              >
                {caption}
              </p>
            </div>

            <div style={{ marginTop: 32, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
              <Link to="/platform" className="mkt-btn mkt-btn--ghost-dark">Step inside</Link>
            </div>
          </div>

          {/* Right — phone */}
          <div
            style={{
              position: "relative",
              display: "flex", justifyContent: "center", alignItems: "center",
            }}
            className="hidden md:flex"
          >
            <ScenePhone scene={scene} phase={phase} width={300} />
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
function InvitationMockup() {
  return (
    <div
      style={{
        background: "linear-gradient(170deg,#0D1B2E 0%,#071426 60%,#1a0709 100%)",
        aspectRatio: "5/6", borderRadius: 4, border: "1px solid var(--mkt-brass-30)",
        padding: "44px 36px", display: "flex", flexDirection: "column",
        boxShadow: "0 36px 90px rgba(0,0,0,0.4)", color: "var(--mkt-cream)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 0%, rgba(169,132,92,0.16), transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>You are invited to</p>
        <div style={{ height: 1, background: "var(--mkt-brass-30)", margin: "16px 0 24px" }} />
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: "2.4rem", lineHeight: 1, letterSpacing: "-0.04em" }}>The Spring</p>
        <p style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "2.4rem", lineHeight: 1, letterSpacing: "-0.04em" }}>Collection</p>
        <p style={{ margin: "32px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mkt-smoke)" }}>April 18 · 19:30</p>
        <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mkt-smoke)" }}>Maison Cordeau · Stockholm</p>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: "relative" }}>
        <div style={{ height: 1, background: "var(--mkt-brass-30)", marginBottom: 16 }} />
        <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.92rem", lineHeight: 1.5, color: "var(--mkt-cream)", opacity: 0.78 }}>
          "A small, slow dinner before the doors open to the rest of the season."
        </p>
        <p style={{ marginTop: 12, fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>— Hélène, your host</p>
      </div>
    </div>
  );
}

function GuestsMockup() {
  const guests = [
    ["Adèle Moreau", "+1", "accepted"],
    ["Felix Costa", "", "accepted"],
    ["Iris Lindqvist", "+1", "pending"],
    ["Tomás Vela", "", "accepted"],
    ["Hana Park", "+2", "accepted"],
    ["Diego Renoir", "", "declined"],
  ];
  return (
    <div
      style={{
        background: "rgba(244,235,221,0.96)",
        aspectRatio: "5/6", borderRadius: 4, border: "1px solid var(--mkt-brass-30)",
        padding: "28px 26px", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 70px rgba(7,20,38,0.18)", color: "var(--mkt-navy)",
      }}
    >
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--mkt-oxblood)" }}>The list · 142 confirmed</p>
      <p style={{ margin: "8px 0 18px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.7rem", letterSpacing: "-0.03em", color: "var(--mkt-navy)" }}>Spring Collection</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {guests.map(([name, plus, state]) => (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", paddingBottom: 8, borderBottom: "1px solid rgba(7,20,38,0.08)" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem" }}>{name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-brass)" }}>{plus}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: state === "accepted" ? "var(--mkt-moss)" : state === "pending" ? "var(--mkt-brass)" : "var(--mkt-oxblood)" }}>{state}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--mkt-brass-30)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-brass)" }}>77% acceptance</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-brass)" }}>Hold list · 12</span>
      </div>
    </div>
  );
}

function CheckinMockup() {
  const arrivals = [["Adèle Moreau","21:14","VIP lane"],["Felix Costa","21:13","Main"],["Hana Park +2","21:11","Main"],["Tomás Vela","21:09","Main"]];
  return (
    <div
      style={{
        background: "linear-gradient(170deg,#071426 0%,#0D1B2E 100%)",
        aspectRatio: "5/6", borderRadius: 4, border: "1px solid var(--mkt-brass-30)",
        padding: "28px 26px", display: "flex", flexDirection: "column",
        boxShadow: "0 36px 90px rgba(0,0,0,0.36)", color: "var(--mkt-cream)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>Door · live</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--mkt-moss)", border: "1px solid rgba(61,74,53,0.5)", padding: "3px 7px", borderRadius: 999 }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--mkt-moss)" }} /> ACTIVE
        </span>
      </div>
      <p style={{ margin: "16px 0 6px", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "2.4rem", color: "var(--mkt-cream)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>184 / 240</p>
      <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mkt-smoke)" }}>Throughput · 26 / min</p>
      <div style={{ marginTop: 18, height: 4, background: "rgba(244,235,221,0.1)" }}>
        <div style={{ width: "77%", height: "100%", background: "var(--mkt-oxblood)" }} />
      </div>
      <p style={{ margin: "22px 0 8px", fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>Recent arrivals</p>
      {arrivals.map(([name, t, lane]) => (
        <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(244,235,221,0.08)", fontFamily: "var(--font-sans)", fontSize: "0.78rem" }}>
          <span>{name}</span>
          <span style={{ color: "var(--mkt-smoke)", fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>{t}</span>
          <span style={{ color: "var(--mkt-brass)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>{lane}</span>
        </div>
      ))}
    </div>
  );
}

const moments = [
  { label: "Invitation", headline: "Every detail implies who belongs.", copy: "Shape the first impression through language, pacing, and restraint. No template energy. No generic call-to-action noise.", mockup: "invitation" },
  { label: "Guest list",  headline: "Build selective gravity.", copy: "Approve, tier, and hold with intent so the room arrives in cadence — never in chaos.", mockup: "guests" },
  { label: "At the door", headline: "Operations that stay invisible.", copy: "Fast check-in and redemption without breaking atmosphere. The system handles pressure while you hold tone.", mockup: "checkin" },
];

function Features() {
  return (
    <section style={{ background: "var(--mkt-cream)", padding: "120px 40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 80 }}>
          <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>Three moments</span>
          <h2 style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2rem,4.6vw,4.2rem)", lineHeight: 0.96, letterSpacing: "-0.04em", color: "var(--mkt-navy)", textWrap: "balance" as CSSProperties["textWrap"] }}>
            A visual rhythm across <span style={{ fontStyle: "italic" }}>every</span> guest touchpoint.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }} className="grid-cols-1 md:grid-cols-3">
          {moments.map((m, i) => (
            <article key={m.label} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {m.mockup === "invitation" && <InvitationMockup />}
              {m.mockup === "guests" && <GuestsMockup />}
              {m.mockup === "checkin" && <CheckinMockup />}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-brass)" }}>0{i + 1}</span>
                  <span style={{ width: 24, height: 1, background: "var(--mkt-brass-30)" }} />
                  <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>{m.label}</span>
                </div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", lineHeight: 1.06, letterSpacing: "-0.025em", color: "var(--mkt-navy)" }}>{m.headline}</h3>
                <p style={{ margin: "14px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.94rem", lineHeight: 1.6, color: "rgba(18,16,14,0.72)", textWrap: "pretty" as CSSProperties["textWrap"] }}>{m.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Use cases ─────────────────────────────────────────────────────────────────
const useCases = ["Private dinners", "Brand events", "Celebrations", "Curated gatherings"];

function UseCases() {
  return (
    <section style={{ background: "var(--mkt-cream)", padding: "100px 40px", borderTop: "1px solid var(--mkt-brass-30)" }}>
      <div
        style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "start" }}
        className="block md:grid"
      >
        <div>
          <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>Designed for</span>
          <h3 style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2rem,3.8vw,3.4rem)", lineHeight: 0.98, letterSpacing: "-0.035em", color: "var(--mkt-navy)" }}>
            Gatherings <span style={{ fontStyle: "italic" }}>where</span> detail matters.
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {useCases.map((u, i) => (
            <div key={u} style={{ border: "1px solid var(--mkt-brass-30)", padding: "26px 28px", background: "rgba(232,216,195,0.4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em", color: "var(--mkt-navy)" }}>{u}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-brass)", letterSpacing: "0.16em" }}>0{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ background: "linear-gradient(180deg,#F4EBDD 0%,#E8D8C3 100%)", padding: "100px 40px", borderTop: "1px solid var(--mkt-brass-30)" }}>
      <div
        style={{
          maxWidth: 880, margin: "0 auto", padding: "72px 56px",
          border: "1px solid var(--mkt-brass-30)",
          background: "rgba(244,235,221,0.6)",
          textAlign: "center",
        }}
      >
        <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>Host with intention</span>
        <h3
          style={{
            margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
            fontSize: "clamp(2.2rem,4.6vw,4rem)", lineHeight: 0.96,
            letterSpacing: "-0.04em", color: "var(--mkt-navy)",
            textWrap: "balance" as CSSProperties["textWrap"],
          }}
        >
          Begin with a quieter kind <br />
          <span style={{ fontStyle: "italic" }}>of</span> confidence.
        </h3>
        <p style={{ margin: "24px auto 0", maxWidth: 540, fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.6, color: "rgba(18,16,14,0.72)", textWrap: "pretty" as CSSProperties["textWrap"] }}>
          Join a private circle of hosts creating thoughtful gatherings with refined invitation, guest, and on-site flow.
        </p>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
          <Link to="/login" className="mkt-btn mkt-btn--ghost-light">Return to your studio</Link>
        </div>
      </div>
    </section>
  );
}

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
