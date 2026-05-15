import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import MiniPhone from "./MiniPhone";

/* ────────────────────────────────────────────────────────────────────────────
   Shared atoms
   ──────────────────────────────────────────────────────────────────────── */

type Tone = "cream" | "navy";

const toneBg = (t: Tone) =>
  t === "cream"
    ? "var(--mkt-cream)"
    : "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)";

const toneInk = (t: Tone) => (t === "cream" ? "var(--mkt-navy)" : "var(--mkt-cream)");
const toneMuted = (t: Tone) => (t === "cream" ? "rgba(18,16,14,0.7)" : "var(--mkt-smoke)");
const toneAccent = (t: Tone) =>
  t === "cream" ? "var(--mkt-oxblood)" : "var(--mkt-brass)";

function StatusBar({ tone = "navy" as Tone }: { tone?: Tone }) {
  return (
    <div
      style={{
        height: 40,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "0 18px 6px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.54rem",
        color: tone === "navy" ? "var(--mkt-cream)" : "var(--mkt-navy)",
        letterSpacing: "0.06em",
      }}
    >
      <span>9:41</span>
      <span>●●● · 100%</span>
    </div>
  );
}

function Eyebrow({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className="mkt-eyebrow"
      style={{
        color: toneAccent(tone),
        fontFamily: "var(--font-mono)",
        fontSize: "0.62rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

type SectionProps = {
  tone: Tone;
  index: string;
  eyebrow: string;
  headline: ReactNode;
  copy: string;
  children: ReactNode;
  reverse?: boolean;
  id?: string;
};

function FeatureSection({
  tone,
  index,
  eyebrow,
  headline,
  copy,
  children,
  reverse,
  id,
}: SectionProps) {
  const ink = toneInk(tone);
  const muted = toneMuted(tone);
  return (
    <section
      id={id}
      style={{
        background: toneBg(tone),
        color: ink,
        padding: "84px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 56,
          alignItems: "center",
        }}
        className={`grid-cols-1 md:grid-cols-2 ${reverse ? "md:[direction:rtl]" : ""}`}
      >
        <div style={{ direction: "ltr" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                color: toneAccent(tone),
              }}
            >
              {index}
            </span>
            <span style={{ width: 22, height: 1, background: "var(--mkt-brass-30)" }} />
            <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(1.9rem,4.4vw,3.4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: ink,
              textWrap: "balance" as CSSProperties["textWrap"],
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              margin: "20px 0 0",
              maxWidth: 460,
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: muted,
            }}
          >
            {copy}
          </p>
        </div>
        <div
          style={{ direction: "ltr", display: "flex", justifyContent: "center" }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/* Hook: cycles through phases when in view; respects reduced motion */
function useInViewCycle(steps: number, dwellMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setPhase(steps - 1);
      return;
    }
    setPhase(0);
    const t = setInterval(() => {
      setPhase((p) => (p + 1) % steps);
    }, dwellMs);
    return () => clearInterval(t);
  }, [inView, steps, dwellMs, reduced]);
  return { ref, phase, inView };
}

/* ────────────────────────────────────────────────────────────────────────────
   1 · Invitation Creator
   ──────────────────────────────────────────────────────────────────────── */

const inviteStyles = [
  { id: "midnight", title: "Midnight Dinner", from: "#0D1B2E", to: "#1a0709", accent: "#A9845C" },
  { id: "velvet", title: "Velvet Club", from: "#3E0C11", to: "#12100E", accent: "#E8D8C3" },
  { id: "garden", title: "Garden Society", from: "#3D4A35", to: "#1f2a18", accent: "#F4EBDD" },
];

function InvitationCreatorDemo() {
  const { ref, phase } = useInViewCycle(inviteStyles.length, 2400);
  const style = inviteStyles[phase];
  return (
    <div ref={ref} style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 180 }}>
        {inviteStyles.map((s, i) => (
          <button
            key={s.id}
            type="button"
            style={{
              textAlign: "left",
              padding: "12px 14px",
              border: `1px solid ${i === phase ? "var(--mkt-oxblood)" : "var(--mkt-brass-30)"}`,
              background: i === phase ? "rgba(90,18,24,0.08)" : "transparent",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--mkt-navy)",
              transition: "all 320ms cubic-bezier(0.22,1,0.36,1)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "default",
            }}
          >
            <span style={{ width: 14, height: 14, background: `linear-gradient(135deg,${s.from},${s.to})`, border: "1px solid var(--mkt-brass-30)" }} />
            {s.title}
            {i === phase && (
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: "var(--mkt-oxblood)", letterSpacing: "0.18em" }}>LIVE</span>
            )}
          </button>
        ))}
      </div>
      <MiniPhone width={240}>
        <div
          key={style.id}
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(170deg,${style.from} 0%,${style.to} 100%)`,
            color: "var(--mkt-cream)",
            animation: "mkt-fade-up 600ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <StatusBar />
          <div style={{ padding: "26px 22px", display: "flex", flexDirection: "column", height: "calc(100% - 40px)", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.54rem", letterSpacing: "0.32em", textTransform: "uppercase", color: style.accent }}>
              You are invited to
            </p>
            <div style={{ height: 1, background: "rgba(244,235,221,0.2)", margin: "14px 0" }} />
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: "1.6rem", lineHeight: 1, letterSpacing: "-0.03em" }}>{style.title}</p>
            <p style={{ margin: "16px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", color: "rgba(244,235,221,0.7)" }}>April 18 · 19:30</p>
            <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", color: "rgba(244,235,221,0.7)" }}>Maison Cordeau</p>
            <div style={{ flex: 1 }} />
            <button
              style={{
                width: "100%", padding: "11px 14px",
                background: style.accent, color: "var(--mkt-navy)",
                border: 0, borderRadius: 999,
                fontFamily: "var(--font-sans)", fontSize: "0.6rem", fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase",
              }}
            >Accept</button>
          </div>
        </div>
      </MiniPhone>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   2 · Event Page Builder + Widgets
   ──────────────────────────────────────────────────────────────────────── */

const widgets = [
  { label: "Hero", icon: "✦", lines: ["The Spring Collection", "April 18 · Maison Cordeau"] },
  { label: "RSVP", icon: "→", lines: ["Confirm by April 12", "Bring +1 · Note dietary"] },
  { label: "Schedule", icon: "·", lines: ["19:30 Welcome · 20:15 Dinner", "22:00 After"] },
  { label: "Dress code", icon: "○", lines: ["Quiet luxury · Black-tie optional"] },
  { label: "Menu", icon: "♢", lines: ["4 courses · Natural wine pairing"] },
  { label: "Location", icon: "◇", lines: ["12 Rue de Rivoli · Stockholm"] },
];

function EventPageBuilderDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });
  return (
    <div ref={ref}>
      <MiniPhone width={260}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)" }}>
          <StatusBar />
          <div style={{ padding: "10px 14px 18px", display: "flex", flexDirection: "column", gap: 8, height: "calc(100% - 40px)", overflow: "hidden" }}>
            {widgets.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
                transition={{ duration: 0.55, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  border: "1px solid var(--mkt-brass-30)",
                  background: "rgba(244,235,221,0.04)",
                  padding: "10px 12px",
                  borderRadius: 6,
                  color: "var(--mkt-cream)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "var(--mkt-brass)", fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}>{w.icon}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.54rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
                    {w.label}
                  </span>
                </div>
                {w.lines.map((l, li) => (
                  <p key={li} style={{ margin: 0, fontFamily: li === 0 ? "var(--font-display)" : "var(--font-sans)", fontSize: li === 0 ? "0.82rem" : "0.62rem", lineHeight: 1.3, color: li === 0 ? "var(--mkt-cream)" : "var(--mkt-smoke)" }}>
                    {l}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </MiniPhone>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   3 · RSVP + Guest List (dual phone)
   ──────────────────────────────────────────────────────────────────────── */

function RsvpDualDemo() {
  const { ref, phase } = useInViewCycle(4, 1600);
  // 0: idle  1: guest taps accept  2: dietary entered  3: host list updates
  const accepted = phase >= 1;
  const dietary = phase >= 2;
  const updated = phase >= 3;

  return (
    <div ref={ref} style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
      {/* Guest phone */}
      <MiniPhone width={210} tilt={-3}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)", color: "var(--mkt-cream)" }}>
          <StatusBar />
          <div style={{ padding: "16px 18px", height: "calc(100% - 40px)", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.28em", color: "var(--mkt-brass)" }}>RSVP</p>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.2rem" }}>Spring Collection</p>
            <button style={{
              padding: "9px 12px",
              background: accepted ? "var(--mkt-moss)" : "var(--mkt-oxblood)",
              color: "var(--mkt-cream)", border: 0, borderRadius: 999,
              fontFamily: "var(--font-sans)", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
              transition: "background 320ms",
            }}>
              {accepted ? "Accepted ✓" : "Accept · +1"}
            </button>
            <button style={{
              padding: "9px 12px", background: "transparent",
              color: "var(--mkt-cream)", border: "1px solid var(--mkt-cream-32)", borderRadius: 999,
              fontFamily: "var(--font-sans)", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              With regret
            </button>
            <div
              style={{
                marginTop: 8,
                opacity: dietary ? 1 : 0.3,
                transform: dietary ? "translateY(0)" : "translateY(8px)",
                transition: "all 400ms cubic-bezier(0.22,1,0.36,1)",
                border: "1px solid var(--mkt-brass-30)", borderRadius: 4, padding: "8px 10px",
              }}
            >
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>DIETARY</p>
              <p style={{ margin: "4px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.66rem" }}>Pescatarian · no shellfish</p>
            </div>
          </div>
        </div>
      </MiniPhone>

      {/* Host phone */}
      <MiniPhone width={210} tilt={3}>
        <div style={{ position: "absolute", inset: 0, background: "var(--mkt-cream)", color: "var(--mkt-navy)" }}>
          <StatusBar tone="cream" />
          <div style={{ padding: "14px 16px" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.26em", color: "var(--mkt-oxblood)" }}>HOST · GUEST LIST</p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {updated ? "143" : "142"} <span style={{ fontSize: "0.6rem", color: "var(--mkt-brass)", letterSpacing: "0.18em" }}>CONFIRMED</span>
            </p>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Adèle Moreau", "+1", true],
                ["Felix Costa", "", true],
                ["Iris Lindqvist", "+1", true],
              ].map(([n, p, ok]) => (
                <div key={n as string} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 6, fontFamily: "var(--font-sans)", fontSize: "0.66rem", paddingBottom: 4, borderBottom: "1px solid rgba(7,20,38,0.08)" }}>
                  <span>{n}</span>
                  <span style={{ color: "var(--mkt-brass)", fontFamily: "var(--font-mono)", fontSize: "0.56rem" }}>{p}</span>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: ok ? "var(--mkt-moss)" : "var(--mkt-brass)", alignSelf: "center" }} />
                </div>
              ))}
              {updated && (
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "1fr auto auto", gap: 6,
                    fontFamily: "var(--font-sans)", fontSize: "0.66rem",
                    paddingBottom: 4, borderBottom: "1px solid rgba(7,20,38,0.08)",
                    background: "rgba(61,74,53,0.12)", padding: "4px 6px", borderRadius: 4,
                    animation: "mkt-fade-up 400ms cubic-bezier(0.22,1,0.36,1) both",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>You · +1</span>
                  <span style={{ color: "var(--mkt-brass)", fontFamily: "var(--font-mono)", fontSize: "0.56rem" }}>NEW</span>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--mkt-moss)", alignSelf: "center" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </MiniPhone>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   4 · TapMarkers
   ──────────────────────────────────────────────────────────────────────── */

function TapMarkerDemo() {
  const { ref, phase } = useInViewCycle(3, 1800);
  const tapping = phase === 1;
  const opened = phase === 2;

  return (
    <div
      ref={ref}
      style={{
        position: "relative", width: "100%", maxWidth: 420, height: 360,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Bar surface */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(180deg,#1a0e08 0%,#0a0604 100%)",
        borderTop: "1px solid var(--mkt-brass-30)",
      }} />

      {/* TapMarker card */}
      <div style={{
        position: "absolute", bottom: 24, left: "18%",
        width: 100, height: 56, borderRadius: 6,
        background: "linear-gradient(135deg,#F4EBDD 0%,#E8D8C3 100%)",
        border: "1px solid var(--mkt-brass)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 22px rgba(0,0,0,0.4)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.82rem", color: "var(--mkt-navy)" }}>Sera</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", letterSpacing: "0.22em", color: "var(--mkt-oxblood)", textTransform: "uppercase" }}>TapMarker · Bar</span>
        {(tapping || opened) && (
          <>
            <span style={{ position: "absolute", inset: -6, borderRadius: 8, border: "2px solid var(--mkt-brass)", animation: "mkt-tap-pulse 1.4s ease-out infinite" }} />
            <span style={{ position: "absolute", inset: -14, borderRadius: 12, border: "1px solid var(--mkt-brass-50)", animation: "mkt-tap-pulse 1.4s ease-out infinite", animationDelay: "0.2s" }} />
          </>
        )}
      </div>

      {/* Phone tilted, approaching marker */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          bottom: tapping || opened ? 40 : 60,
          transform: `rotate(${tapping ? -18 : -22}deg)`,
          transition: "all 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <MiniPhone width={150}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)", color: "var(--mkt-cream)" }}>
            <StatusBar />
            {!opened ? (
              <div style={{ padding: "20px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--mkt-brass)" strokeWidth="1.4">
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" strokeLinecap="round" />
                </svg>
                <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>READY TO TAP</p>
              </div>
            ) : (
              <div style={{ padding: "12px 12px", animation: "mkt-fade-up 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.46rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>BAR · MENU</p>
                <p style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.86rem" }}>Tonight's pours</p>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {["Negroni Bianco", "Smoke & Plum", "Rosé · Domaine"].map(d => (
                    <p key={d} style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.56rem", color: "var(--mkt-smoke)" }}>{d}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MiniPhone>
      </div>

      {/* Caption hint */}
      <p style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.24em", color: "var(--mkt-brass)" }}>
        TAP · OPENS THE NIGHT
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   5 · TapScan (staff verification)
   ──────────────────────────────────────────────────────────────────────── */

function TapScanDemo() {
  const { ref, phase } = useInViewCycle(3, 1800);
  const scanning = phase === 0;
  const verified = phase === 1;
  const checkedIn = phase === 2;

  return (
    <div ref={ref}>
      <MiniPhone width={250}>
        <div style={{ position: "absolute", inset: 0, background: "var(--mkt-cream)", color: "var(--mkt-navy)" }}>
          <StatusBar tone="cream" />
          <div style={{ padding: "14px 16px", height: "calc(100% - 40px)", display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.26em", color: "var(--mkt-oxblood)" }}>TAPSCAN · STAFF</p>
            <div
              style={{
                position: "relative", aspectRatio: "1", borderRadius: 4,
                background: "var(--mkt-navy)", overflow: "hidden",
                border: "1px solid var(--mkt-brass-30)",
              }}
            >
              {scanning ? (
                <>
                  {[0,1,2,3].map(c => (
                    <span key={c} style={{
                      position: "absolute", width: 14, height: 14,
                      borderColor: "var(--mkt-brass)", borderWidth: 2, borderStyle: "solid",
                      ...(c === 0 ? { top: 10, left: 10, borderRight: 0, borderBottom: 0 } : {}),
                      ...(c === 1 ? { top: 10, right: 10, borderLeft: 0, borderBottom: 0 } : {}),
                      ...(c === 2 ? { bottom: 10, left: 10, borderRight: 0, borderTop: 0 } : {}),
                      ...(c === 3 ? { bottom: 10, right: 10, borderLeft: 0, borderTop: 0 } : {}),
                    }} />
                  ))}
                  <span style={{
                    position: "absolute", left: 10, right: 10, top: "50%",
                    height: 1, background: "var(--mkt-brass)",
                    boxShadow: "0 0 10px var(--mkt-brass)",
                    animation: "mkt-scan-line 1.6s ease-in-out infinite",
                  }} />
                </>
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, animation: "mkt-fade-up 360ms cubic-bezier(0.22,1,0.36,1) both", padding: 12, textAlign: "center" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: "var(--mkt-moss)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mkt-cream)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1rem", color: "var(--mkt-cream)" }}>
                    {checkedIn ? "Checked in" : "Adèle Moreau"}
                  </p>
                  <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.52rem", letterSpacing: "0.2em", color: "var(--mkt-smoke)" }}>
                    RSVP CONFIRMED · 3 TICKETS
                  </p>
                </div>
              )}
            </div>
            <button
              style={{
                padding: "10px 14px",
                background: checkedIn ? "var(--mkt-moss)" : verified ? "var(--mkt-oxblood)" : "rgba(7,20,38,0.1)",
                color: verified || checkedIn ? "var(--mkt-cream)" : "rgba(7,20,38,0.4)",
                border: 0, borderRadius: 999, fontFamily: "var(--font-sans)",
                fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
                transition: "background 280ms",
              }}
            >
              {checkedIn ? "✓ Welcomed" : "Check guest in"}
            </button>
          </div>
        </div>
      </MiniPhone>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   6 · TapStation + Drink Tickets
   ──────────────────────────────────────────────────────────────────────── */

function TapStationDemo() {
  const { ref, phase } = useInViewCycle(5, 1500);
  // 0: 5 tickets idle  1: tap  2: redeemed (4)  3: bartender confirm  4: duplicate attempt
  const tickets = phase >= 2 ? 4 : 5;
  const tapping = phase === 1;
  const redeemed = phase === 2 || phase === 3 || phase === 4;
  const duplicate = phase === 4;

  return (
    <div ref={ref} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
      {/* Guest wallet phone */}
      <MiniPhone width={200}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)", color: "var(--mkt-cream)" }}>
          <StatusBar />
          <div style={{ padding: "14px 16px", height: "calc(100% - 40px)", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.24em", color: "var(--mkt-brass)" }}>WALLET · DRINKS</p>
            <div style={{ textAlign: "center", padding: "14px 0" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "3rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--mkt-cream)", lineHeight: 1, transition: "color 320ms" }}>
                {tickets}
              </p>
              <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>
                {tickets === 1 ? "TICKET LEFT" : "TICKETS LEFT"}
              </p>
            </div>
            <div style={{
              border: tapping ? "1px solid var(--mkt-brass)" : "1px solid var(--mkt-cream-14)",
              background: tapping ? "rgba(169,132,92,0.12)" : "rgba(7,20,38,0.4)",
              padding: "10px 12px", borderRadius: 6,
              transition: "all 320ms",
            }}>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", color: "var(--mkt-cream)" }}>
                {tapping ? "Holding to TapStation…" : "Hold near TapStation"}
              </p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.18em", color: "var(--mkt-brass)" }}>NFC · QR READY</p>
            </div>
          </div>
        </div>
      </MiniPhone>

      {/* Bartender screen */}
      <MiniPhone width={200}>
        <div style={{ position: "absolute", inset: 0, background: "var(--mkt-cream)", color: "var(--mkt-navy)" }}>
          <StatusBar tone="cream" />
          <div style={{ padding: "14px 16px", height: "calc(100% - 40px)", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.26em", color: "var(--mkt-oxblood)" }}>TAPSTATION · BAR 01</p>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1rem" }}>Spring Collection</p>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {duplicate ? (
                <div style={{ textAlign: "center", animation: "mkt-fade-up 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: "var(--mkt-oxblood)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--mkt-cream)", fontSize: 20, fontWeight: 600 }}>!</span>
                  <p style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.92rem", color: "var(--mkt-oxblood)" }}>Already redeemed</p>
                  <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.18em", color: "var(--mkt-brass)" }}>21:14 · BAR 01</p>
                </div>
              ) : redeemed ? (
                <div style={{ textAlign: "center", animation: "mkt-fade-up 400ms cubic-bezier(0.22,1,0.36,1) both" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: "var(--mkt-moss)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mkt-cream)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <p style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.92rem" }}>Redeemed</p>
                  <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.18em", color: "var(--mkt-brass)" }}>4 LEFT · ADÈLE M.</p>
                </div>
              ) : (
                <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>WAITING…</p>
              )}
            </div>
          </div>
        </div>
      </MiniPhone>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   7 · Check-in
   ──────────────────────────────────────────────────────────────────────── */

function CheckInDemo() {
  const { ref, phase } = useInViewCycle(4, 1500);
  const arrived = Math.min(184 + phase * 4, 196);
  const pct = (arrived / 240) * 100;

  return (
    <div ref={ref}>
      <MiniPhone width={250}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)", color: "var(--mkt-cream)" }}>
          <StatusBar />
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.54rem", letterSpacing: "0.24em", color: "var(--mkt-brass)" }}>DOOR · LIVE</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--mkt-moss)", border: "1px solid rgba(61,74,53,0.5)", padding: "2px 6px", borderRadius: 999 }}>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--mkt-moss)" }} />
                ACTIVE
              </span>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.8rem", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {arrived} / 240
            </p>
            <div style={{ height: 4, background: "rgba(244,235,221,0.1)" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--mkt-oxblood)", transition: "width 600ms cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
            <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>RECENT ARRIVALS</p>
            {[
              ["Adèle Moreau", "21:14"],
              ["Felix Costa", "21:13"],
              ["Hana Park +2", "21:11"],
              ["Tomás Vela", "21:09"],
            ].map(([n, t], i) => (
              <div key={n} style={{
                display: "grid", gridTemplateColumns: "1fr auto", gap: 8,
                padding: "5px 0", borderBottom: "1px solid rgba(244,235,221,0.08)",
                fontFamily: "var(--font-sans)", fontSize: "0.66rem",
                opacity: i < phase + 1 ? 1 : 0.35,
                transition: "opacity 400ms",
              }}>
                <span>{n}</span>
                <span style={{ color: "var(--mkt-smoke)", fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </MiniPhone>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   8 · Host Dashboard
   ──────────────────────────────────────────────────────────────────────── */

const dashCards = [
  { label: "RSVP", value: "143/240", note: "+12 today" },
  { label: "Tickets", value: "412", note: "of 720 issued" },
  { label: "Check-in", value: "76%", note: "Throughput steady" },
  { label: "Hold list", value: "12", note: "Awaiting tier 2" },
];

function HostDashboardDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  return (
    <div ref={ref} style={{ width: "100%", maxWidth: 460 }}>
      <div
        style={{
          background: "rgba(244,235,221,0.04)",
          border: "1px solid var(--mkt-brass-30)",
          padding: 18,
          borderRadius: 4,
          color: "var(--mkt-cream)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.26em", color: "var(--mkt-brass)" }}>HOST · STUDIO</p>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.9rem" }}>Spring Collection</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {dashCards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                border: "1px solid var(--mkt-brass-30)",
                background: "rgba(7,20,38,0.6)",
                padding: "12px 14px", borderRadius: 4,
              }}
            >
              <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.22em", color: "var(--mkt-brass)" }}>{c.label}</p>
              <p style={{ margin: "6px 0 0", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.3rem", fontVariantNumeric: "tabular-nums" }}>{c.value}</p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.62rem", color: "var(--mkt-smoke)" }}>{c.note}</p>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Edit event", "View page", "Copy invite", "TapScan", "Tickets", "Guest list"].map((q, i) => (
            <motion.span
              key={q}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.18em",
                textTransform: "uppercase", color: "var(--mkt-cream)",
                border: "1px solid var(--mkt-cream-14)", padding: "6px 10px", borderRadius: 999,
              }}
            >
              {q}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Final CTA — Start with the invitation
   ──────────────────────────────────────────────────────────────────────── */

export function FinalProductCTA() {
  return (
    <section style={{ background: "linear-gradient(180deg,#F4EBDD 0%,#E8D8C3 100%)", padding: "120px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Eyebrow tone="cream">Begin</Eyebrow>
        <h2
          style={{
            margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
            fontSize: "clamp(2.2rem,5.4vw,4.4rem)", lineHeight: 0.94,
            letterSpacing: "-0.04em", color: "var(--mkt-navy)",
            textWrap: "balance" as CSSProperties["textWrap"],
          }}
        >
          Start with <span style={{ fontStyle: "italic" }}>the invitation</span>.
        </h2>
        <p style={{ margin: "20px auto 0", maxWidth: 480, fontFamily: "var(--font-sans)", fontSize: "1rem", lineHeight: 1.6, color: "rgba(18,16,14,0.7)" }}>
          Shape the cover. Build the page. Welcome the room. Sera holds every detail of the night.
        </p>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link to="/host/events/new" className="mkt-btn mkt-btn--primary">Create an event</Link>
          <Link to="/platform" className="mkt-btn mkt-btn--ghost-light" style={{ color: "var(--mkt-navy)", borderColor: "var(--mkt-navy-22)" }}>See how it works</Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Public assembly
   ──────────────────────────────────────────────────────────────────────── */

export default function ProductDemos() {
  return (
    <>
      <FeatureSection
        tone="cream"
        index="01"
        eyebrow="Invitation Creator"
        headline={<>Set the tone <span style={{ fontStyle: "italic" }}>before</span> anyone arrives.</>}
        copy="Choose a style, write a personal note, and watch the cover come alive. Invitations that feel like part of the evening — never an admin task."
      >
        <InvitationCreatorDemo />
      </FeatureSection>

      <FeatureSection
        tone="navy"
        index="02"
        eyebrow="Event Page Builder"
        headline={<>A private page <span style={{ fontStyle: "italic" }}>for every</span> detail worth remembering.</>}
        copy="Drag in widgets — schedule, dress code, menu, location — and the invitation becomes a living event page guests open all week."
        reverse
      >
        <EventPageBuilderDemo />
      </FeatureSection>

      <FeatureSection
        tone="cream"
        index="03"
        eyebrow="RSVP Flow"
        headline={<>Know who's coming <span style={{ fontStyle: "italic" }}>without</span> chasing anyone.</>}
        copy="Guests respond in two taps. Plus-ones, dietary notes, and arrivals land directly in your guest list — no spreadsheets, no chasing."
      >
        <RsvpDualDemo />
      </FeatureSection>

      <FeatureSection
        tone="navy"
        index="04"
        eyebrow="TapMarkers"
        headline={<>Place the night <span style={{ fontStyle: "italic" }}>exactly</span> where it happens.</>}
        copy="Discreet NFC and QR markers turn tables, bars, entrances, and stations into interactive moments — menus, playlists, tickets, seating."
        reverse
      >
        <TapMarkerDemo />
      </FeatureSection>

      <FeatureSection
        tone="cream"
        index="05"
        eyebrow="TapScan"
        headline={<>Scan once. <span style={{ fontStyle: "italic" }}>Know</span> instantly.</>}
        copy="Hosts and staff verify guests, tickets, and RSVP status from one calm interface. Check guests in without breaking the room."
      >
        <TapScanDemo />
      </FeatureSection>

      <FeatureSection
        tone="navy"
        index="06"
        eyebrow="TapStation · Drink Tickets"
        headline={<>The bar, <span style={{ fontStyle: "italic" }}>without</span> the paper tickets.</>}
        copy="Guests redeem from their phone at a TapStation marker. Sera counts in the background — no double pours, no queue, no fuss."
        reverse
      >
        <TapStationDemo />
      </FeatureSection>

      <FeatureSection
        tone="cream"
        index="07"
        eyebrow="Guest Check-in"
        headline={<>Know the room <span style={{ fontStyle: "italic" }}>as it</span> fills.</>}
        copy="Watch arrivals land in real time. Throughput, lanes, and progress visible at a glance — so the evening keeps moving."
      >
        <CheckInDemo />
      </FeatureSection>

      <FeatureSection
        tone="navy"
        index="08"
        eyebrow="Host Dashboard"
        headline={<>One place to <span style={{ fontStyle: "italic" }}>shape, send,</span> and run the evening.</>}
        copy="From invitation to last call, every moving part — RSVPs, tickets, check-in, quick actions — held together in your studio."
        reverse
      >
        <HostDashboardDemo />
      </FeatureSection>
    </>
  );
}