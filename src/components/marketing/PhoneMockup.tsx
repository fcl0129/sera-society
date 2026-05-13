import { useEffect, useState, CSSProperties } from "react";

type Scene = "invite" | "redeem" | "nfc";

// ── Helpers ──────────────────────────────────────────────────────────────────
function usePhaseLoop(steps: number, dwellMs: number, playing: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => (x + 1) % steps), dwellMs);
    return () => clearInterval(t);
  }, [steps, dwellMs, playing]);
  return i;
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <div
      style={{
        height: 44, display: "flex", alignItems: "flex-end",
        justifyContent: "space-between", padding: "0 20px 8px",
        fontFamily: "var(--font-mono)", fontSize: "0.58rem",
        color: "var(--mkt-cream)", letterSpacing: "0.06em",
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span>●●●</span>
        <span>WiFi</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ── Scene: Invitation arrives ─────────────────────────────────────────────────
function SceneInvite({ phase }: { phase: number }) {
  const showNotif = phase === 0;
  const showInvite = phase >= 1;
  const tapping = phase === 2;
  const confirmed = phase === 3;

  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)" }}>
      <StatusBar />

      {/* Notification */}
      <div
        style={{
          position: "absolute", top: 60, left: 14, right: 14,
          background: "rgba(244,235,221,0.08)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(244,235,221,0.16)", borderRadius: 14,
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
          transform: showNotif ? "translateY(0)" : "translateY(-80px)",
          opacity: showNotif ? 1 : 0,
          transition: "all 520ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 6, background: "var(--mkt-oxblood)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", color: "var(--mkt-cream)", fontSize: 16, fontStyle: "italic",
          }}
        >S</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--mkt-cream)" }}>Sera Society</p>
          <p style={{ margin: "1px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.64rem", color: "var(--mkt-smoke)" }}>
            Hélène invited you to Spring Collection.
          </p>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.54rem", color: "var(--mkt-brass)", letterSpacing: "0.1em" }}>NOW</span>
      </div>

      {/* Full invitation */}
      <div
        style={{
          position: "absolute", top: showInvite ? 50 : "100%", left: 0, right: 0, bottom: 0,
          background: "linear-gradient(170deg,#0D1B2E 0%,#071426 50%,#1a0709 100%)",
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: "32px 22px 22px",
          transition: "top 700ms cubic-bezier(0.22,1,0.36,1)",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.54rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--mkt-brass)", textAlign: "center" }}>
          You are invited to
        </p>
        <div style={{ height: 1, background: "var(--mkt-brass-30)", margin: "12px 0" }} />
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: "1.7rem", letterSpacing: "-0.04em", lineHeight: 1, textAlign: "center", color: "var(--mkt-cream)" }}>
          The Spring
        </p>
        <p style={{ margin: "2px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.7rem", letterSpacing: "-0.04em", lineHeight: 1, textAlign: "center", color: "var(--mkt-cream)" }}>
          Collection
        </p>
        <p style={{ margin: "18px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mkt-smoke)", textAlign: "center" }}>
          April 18 · 19:30 · Maison Cordeau
        </p>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: confirmed ? 0 : 1, transition: "opacity 300ms" }}>
          <button
            style={{
              width: "100%", padding: "12px 16px",
              background: tapping ? "var(--mkt-oxblood-dark)" : "var(--mkt-oxblood)",
              color: "var(--mkt-cream)", border: 0, borderRadius: 999,
              fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 500,
              letterSpacing: "0.2em", textTransform: "uppercase",
              transform: tapping ? "scale(0.98)" : "scale(1)",
              transition: "all 200ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >Accept · Bring +1</button>
          <button
            style={{
              width: "100%", padding: "12px 16px",
              background: "transparent", color: "var(--mkt-cream)",
              border: "1px solid var(--mkt-cream-32)", borderRadius: 999,
              fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 500,
              letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
            }}
          >With regret</button>
        </div>
        {confirmed && (
          <div
            style={{
              position: "absolute", bottom: 22, left: 22, right: 22,
              border: "1px solid rgba(61,74,53,0.5)", background: "rgba(61,74,53,0.16)",
              padding: "14px 16px", borderRadius: 8,
              display: "flex", alignItems: "center", gap: 10,
              animation: "mkt-fade-up 500ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--mkt-moss)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--mkt-cream)", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--mkt-cream)" }}>Seat confirmed · +1</p>
              <p style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--mkt-smoke)" }}>DR-0184 ready in your wallet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Scene: Drink ticket redemption ────────────────────────────────────────────
function SceneRedeem({ phase }: { phase: number }) {
  const tapping = phase === 2;
  const redeemed = phase === 3;

  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)" }}>
      <StatusBar />
      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", height: "calc(100% - 44px)" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
          Your wallet · DR-0184
        </p>
        <div style={{ height: 1, background: "var(--mkt-brass-30)", margin: "14px 0" }} />
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.4rem", letterSpacing: "-0.03em", color: "var(--mkt-cream)" }}>
          Drink ticket
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.15rem", color: "var(--mkt-cream)", opacity: 0.7 }}>
          Spring Collection
        </p>
        <p style={{ margin: "8px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-smoke)", letterSpacing: "0.12em" }}>
          April 18 · Maison Cordeau
        </p>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* QR placeholder */}
          <div
            style={{
              width: 120, height: 120,
              border: "1px solid var(--mkt-brass-30)",
              background: "rgba(244,235,221,0.04)",
              display: "grid", placeItems: "center",
              position: "relative",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 3, padding: 12 }}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={{ width: "100%", aspectRatio: "1", background: [0,1,3,5,6,8,10,14,16,18,20,21,23,24].includes(i) ? "var(--mkt-cream)" : "transparent" }} />
              ))}
            </div>
            {tapping && (
              <div style={{ position: "absolute", inset: -12, border: "2px solid var(--mkt-brass)", borderRadius: 4, animation: "mkt-tap-pulse 1.2s ease-out infinite" }} />
            )}
          </div>
        </div>

        {!redeemed ? (
          <div
            style={{
              border: "1px solid var(--mkt-cream-14)", borderRadius: 8,
              padding: "14px 16px", background: "rgba(7,20,38,0.4)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--mkt-cream)" }}>Hold to bartender</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--mkt-brass)" }}>NFC ready</span>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid rgba(61,74,53,0.5)", borderRadius: 8,
              padding: "14px 16px", background: "rgba(61,74,53,0.16)",
              display: "flex", alignItems: "center", gap: 10,
              animation: "mkt-fade-up 400ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: 999, background: "var(--mkt-moss)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mkt-cream)" }}>Redeemed · 21:14</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Scene: NFC door tap ───────────────────────────────────────────────────────
function SceneNfc({ phase }: { phase: number }) {
  const scanning = phase === 1;
  const tapping = phase === 2;
  const confirmed = phase === 3;

  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#071426 0%,#0D1B2E 100%)" }}>
      <StatusBar />
      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12, height: "calc(100% - 44px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
            Door · check-in
          </p>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--mkt-moss)",
              border: "1px solid rgba(61,74,53,0.5)", padding: "3px 7px", borderRadius: 999,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--mkt-moss)" }} />
            ACTIVE
          </span>
        </div>
        <div style={{ height: 1, background: "var(--mkt-brass-30)" }} />

        <div style={{ textAlign: "center", padding: "28px 0" }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: 999, margin: "0 auto",
              border: `2px solid ${confirmed ? "rgba(61,74,53,0.6)" : tapping ? "var(--mkt-brass)" : "var(--mkt-cream-14)"}`,
              background: confirmed ? "rgba(61,74,53,0.16)" : "rgba(7,20,38,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 400ms cubic-bezier(0.22,1,0.36,1)",
              boxShadow: tapping ? "0 0 0 8px rgba(169,132,92,0.1)" : "none",
            }}
          >
            {confirmed ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mkt-moss)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--mkt-brass)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity={scanning || tapping ? 1 : 0.4}>
                <path d="M12 8V12M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <p style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--mkt-cream)", letterSpacing: "-0.025em" }}>
            {confirmed ? "Welcome, Adèle" : scanning ? "Hold steady…" : "Tap to enter"}
          </p>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--mkt-smoke)", letterSpacing: "0.12em" }}>
            {confirmed ? "VIP lane · 21:14" : "NFC + QR · door scan"}
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
            Recent arrivals
          </p>
          {[["Felix Costa", "21:13", "Main"], ["Hana Park +2", "21:11", "Main"]].map(([name, t, lane]) => (
            <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(244,235,221,0.08)" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "var(--mkt-cream)" }}>{name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--mkt-smoke)" }}>{t}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--mkt-brass)", textTransform: "uppercase", letterSpacing: "0.14em" }}>{lane}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Phone frame ───────────────────────────────────────────────────────────────
function PhoneFrame({ children, width = 280 }: { children: React.ReactNode; width?: number }) {
  const W = width;
  const H = width * 2;
  return (
    <div
      style={{
        width: W, height: H,
        borderRadius: W * 0.13, padding: W * 0.038,
        background: "#0a0a0a",
        boxShadow: "0 36px 90px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(244,235,221,0.06)",
        position: "relative", flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute", top: W * 0.045, left: "50%", transform: "translateX(-50%)",
          width: W * 0.32, height: W * 0.07,
          background: "#000", borderRadius: W * 0.04, zIndex: 10,
        }}
      />
      <div
        style={{
          position: "relative", height: "100%", width: "100%",
          borderRadius: W * 0.1, overflow: "hidden",
          background: "var(--mkt-navy)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
type Props = {
  scene: Scene;
  playing?: boolean;
  width?: number;
  phase?: number;
};

export function PhoneMockup({ scene, playing = true, width = 280, phase: externalPhase }: Props) {
  const autoPhase = usePhaseLoop(4, 1800, playing && externalPhase === undefined);
  const phase = externalPhase !== undefined ? externalPhase : autoPhase;

  return (
    <PhoneFrame width={width}>
      {scene === "invite"  && <SceneInvite  phase={phase} />}
      {scene === "redeem"  && <SceneRedeem  phase={phase} />}
      {scene === "nfc"     && <SceneNfc     phase={phase} />}
    </PhoneFrame>
  );
}

// Used by ScrollHero to drive scene from scroll progress
export function ScenePhone({ scene, phase, width = 300 }: { scene: Scene; phase: number; width?: number }) {
  return (
    <PhoneFrame width={width}>
      {scene === "invite"  && <SceneInvite  phase={phase} />}
      {scene === "redeem"  && <SceneRedeem  phase={phase} />}
      {scene === "nfc"     && <SceneNfc     phase={phase} />}
    </PhoneFrame>
  );
}
