import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import MktLayout from "@/components/marketing/MktLayout";
import PageHero from "@/components/marketing/PageHero";
import SectionTransition from "@/components/marketing/SectionTransition";

const principles = [
  { n: "01", title: "Editorial first", body: "We design rooms before we design features. The host should always feel like they're reading, not configuring." },
  { n: "02", title: "Restraint as luxury", body: "One CTA, one accent color, one display face. Sera adds nothing the host hasn't asked for." },
  { n: "03", title: "Operations stay invisible", body: "Throughput, queues, retries, rate-limits — the platform absorbs them so the atmosphere never has to." },
  { n: "04", title: "Private by default", body: "Every event page is reachable only through a signed link. Nothing about a Sera evening is indexable, shareable, or guessable." },
];

export default function About() {
  return (
    <MktLayout>
      <PageHero
        eyebrow="The house"
        title={<>Built by a host, <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>for</span> hosts.</>}
        lede="Sera Society is a private platform for the parts of an evening hosts shouldn't have to carry — invitations, lists, RSVPs, check-in, drinks. We hold what would otherwise be held in your head."
      >
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
          <Link to="/platform" className="mkt-btn mkt-btn--ghost-dark">Read the platform</Link>
        </div>
      </PageHero>

      <SectionTransition from="navy" to="cream" />

      {/* Letter from the founder */}
      <section style={{ background: "var(--mkt-cream)", padding: "120px 40px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>A letter from the founder</span>
          <h2
            style={{
              margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
              fontSize: "clamp(2.2rem,4.8vw,4.4rem)", lineHeight: 0.96, letterSpacing: "-0.045em",
              color: "var(--mkt-navy)",
              textWrap: "balance" as CSSProperties["textWrap"],
            }}
          >
            Events <span style={{ fontStyle: "italic" }}>crash</span> for the same three reasons.<br />
            So I built the layer that holds them.
          </h2>

          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }} className="block md:grid">
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.7, color: "var(--mkt-black)" }}>
                I started Sera Society because the same things kept going wrong at the same kinds of evenings —
                and they were never problems of taste. They were problems of infrastructure.
              </p>
              <p style={{ margin: "20px 0 0", fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.7, color: "var(--mkt-black)" }}>
                An evening that wasn't <em>effective</em>. Hours of attention poured into details guests never
                noticed, while the things they did see — the invitation, the door, the drink line — stuttered.
              </p>
              <p style={{ margin: "20px 0 0", fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.7, color: "var(--mkt-black)" }}>
                Guests who were <em>confused</em>. Unsure where to be, when, or whether their plus-one had been confirmed.
                The room felt assembled, not designed.
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.7, color: "var(--mkt-black)" }}>
                A host who couldn't <em>keep track</em>. Invitations in one place, the guest list in another,
                the drinks list on someone else's phone — and inevitably, a thread dropped.
              </p>
              <p style={{ margin: "20px 0 0", fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.7, color: "var(--mkt-black)" }}>
                Sera Society is the layer I wished I'd had. A single private place that carries the invitation,
                the list, the door, and the bar, so the host can keep their attention on the room.
              </p>
              <p style={{ margin: "32px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.72rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
                — Fanny Hallencreutz, founder
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.06em", color: "rgba(18,16,14,0.5)" }}>
                Stockholm · est. privately
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionTransition from="cream" to="navy" />

      {/* Principles */}
      <section style={{ background: "var(--mkt-navy)", padding: "120px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 64, alignItems: "end", marginBottom: 56 }}
            className="block md:grid"
          >
            <div>
              <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>House manual</span>
              <h2
                style={{
                  margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
                  fontSize: "clamp(2rem,4.4vw,3.8rem)", lineHeight: 0.96,
                  letterSpacing: "-0.04em", color: "var(--mkt-cream)",
                }}
              >
                Four rules<br /><span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>we keep</span>.
              </h2>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.15rem", lineHeight: 1.55, color: "var(--mkt-smoke)", maxWidth: 520 }}>
              These shape every Sera surface — the marketing site, the studio, the door, the bar.
              They predate any feature in the platform.
            </p>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 0, borderTop: "1px solid var(--mkt-brass-30)" }}
            className="grid-cols-1 md:grid-cols-2"
          >
            {principles.map((p, i) => (
              <article
                key={p.n}
                style={{
                  padding: "44px 32px",
                  borderRight: i % 2 === 0 ? "1px solid var(--mkt-brass-30)" : "none",
                  borderBottom: i < 2 ? "1px solid var(--mkt-brass-30)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", letterSpacing: "0.18em", color: "var(--mkt-brass)" }}>{p.n}</span>
                  <span style={{ flex: 1, height: 1, background: "var(--mkt-brass-30)" }} />
                </div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.8rem", letterSpacing: "-0.025em", color: "var(--mkt-cream)", lineHeight: 1.06 }}>{p.title}</h3>
                <p style={{ margin: "16px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.95rem", lineHeight: 1.65, color: "var(--mkt-smoke)", maxWidth: 480 }}>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionTransition from="navy" to="cream" />

      {/* Next-step strip */}
      <section style={{ background: "linear-gradient(180deg,#F4EBDD 0%,#E8D8C3 100%)", padding: "80px 40px" }}>
        <div
          style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}
          className="block md:grid"
        >
          <div>
            <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>If you'd like to host with us</span>
            <h3 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.6rem,3.2vw,2.8rem)", lineHeight: 1, letterSpacing: "-0.03em", color: "var(--mkt-navy)" }}>
              Begin with a short note.
            </h3>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/contact" className="mkt-btn mkt-btn--ghost-light">Write to the house</Link>
            <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
          </div>
        </div>
      </section>
    </MktLayout>
  );
}
