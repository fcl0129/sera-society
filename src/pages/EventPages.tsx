import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import MktLayout from "@/components/marketing/MktLayout";
import PageHero from "@/components/marketing/PageHero";

const principles = [
  ["A page per guest", "Each link carries who they are, what state they're in, and what only they need to see."],
  ["Narrative, then logistics", "The host's message sits above the schedule. The schedule sits above the form."],
  ["Live without refresh", "Schedule updates, weather notes, room changes — surfaced in place."],
  ["One CTA, sometimes two", "Open the pass; hold it in wallet. Never four buttons in a row."],
];

const schedule = [
  ["19:30", "Doors · salon vert"],
  ["20:15", "Seated dinner · five courses, paired wines"],
  ["22:00", "Coffee & petits fours · lower gallery"],
  ["23:30", "Music until late · library"],
];

const details = [
  ["Status", "Seat held · +1 confirmed"],
  ["Dress", "Cocktail"],
  ["Drink ticket", "DR-0184 · ready"],
  ["Arrival", "Salon vert, north entrance"],
];

export default function EventPages() {
  return (
    <MktLayout>
      <PageHero
        eyebrow="Event pages"
        title={<>The page <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>past</span> the cover.</>}
        lede="Every guest reaches a destination written specifically for them — schedule, dress, venue, plus-one status, drink ticket. Beautiful before functionality is noticed."
      >
        <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
      </PageHero>

      <section style={{ background: "var(--mkt-cream)", padding: "120px 40px" }}>
        <div
          style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "start" }}
          className="block md:grid"
        >
          {/* Mocked event page */}
          <div
            style={{
              background: "linear-gradient(170deg,#0D1B2E 0%,#071426 100%)",
              border: "1px solid var(--mkt-brass-30)",
              boxShadow: "0 36px 100px rgba(0,0,0,0.36)",
              color: "var(--mkt-cream)", padding: "48px 44px",
              display: "flex", flexDirection: "column", gap: 30,
            }}
          >
            <header>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.6rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
                Maison Cordeau · for Adèle Moreau
              </p>
              <h2 style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(2rem,4.2vw,3.4rem)", lineHeight: 1, letterSpacing: "-0.04em" }}>
                The Spring Collection
              </h2>
              <p style={{ margin: "12px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.74rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mkt-smoke)" }}>
                April 18 · 19:30 · Stockholm
              </p>
            </header>

            <hr style={{ border: 0, height: 1, background: "var(--mkt-brass-30)", margin: 0 }} />

            <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.55, color: "var(--mkt-cream)", opacity: 0.86, maxWidth: 480 }}>
              "A small, slow dinner before the doors open to the rest of the season. Bring the friend you'd want sat next to you."
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {details.map(([k, v]) => (
                <div key={k} style={{ border: "1px solid var(--mkt-cream-14)", padding: "14px 16px" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>{k}</p>
                  <p style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--mkt-cream)", letterSpacing: "-0.02em" }}>{v}</p>
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid var(--mkt-brass-30)", padding: "20px 22px", background: "rgba(169,132,92,0.04)" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>Schedule</p>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {schedule.map(([t, what]) => (
                  <div key={t} style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "baseline", gap: 14 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--mkt-brass)" }}>{t}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem" }}>{what}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/request-access" className="mkt-btn mkt-btn--primary">Open your pass</Link>
              <button type="button" className="mkt-btn mkt-btn--ghost-dark">Hold in wallet</button>
            </div>
          </div>

          {/* Principles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "sticky", top: 100 }}>
            <div>
              <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>Principles</span>
              <h2 style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.8rem,3.2vw,3rem)", lineHeight: 1, letterSpacing: "-0.035em", color: "var(--mkt-navy)" }}>
                Composed, <span style={{ fontStyle: "italic" }}>not</span> assembled.
              </h2>
            </div>

            {principles.map(([h, c]) => (
              <div key={h} style={{ paddingTop: 18, borderTop: "1px solid var(--mkt-brass-30)" }}>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--mkt-navy)", letterSpacing: "-0.02em" }}>{h}</p>
                <p style={{ margin: "8px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.92rem", lineHeight: 1.6, color: "rgba(18,16,14,0.7)" }}>{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MktLayout>
  );
}
