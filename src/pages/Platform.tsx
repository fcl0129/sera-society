import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import MktLayout from "@/components/marketing/MktLayout";
import PageHero from "@/components/marketing/PageHero";

const capabilities = [
  { label: "01", title: "Invitations with atmosphere", body: "Editorial covers, private links, and reply prompts written in the host's own voice. Sera is the only place a guest hears from you between save-the-date and the door.", moments: ["Cover composer", "Private RSVP link", "Plus-one and dietary fields", "Host message"] },
  { label: "02", title: "A guest list with selective gravity", body: "Approve, tier, and hold with intent. Waitlists, plus-ones, and dietary notes are surfaced where the host needs them — not buried three menus deep.", moments: ["Tiered access states", "Hold list", "Notes on every guest", "Bulk approve / decline"] },
  { label: "03", title: "Event pages, not registration forms", body: "A digital invitation that reads like the start of the evening: dress code, schedule, venue notes, and a small piece of the host's voice carrying through.", moments: ["Event narrative", "Dress + schedule", "Venue and arrival guidance", "Per-guest status"] },
  { label: "04", title: "Door flow that holds the mood", body: "Fast lookup, NFC and QR side by side, hold-list overrides without breaking pacing. Pressure is absorbed by the system, never the room.", moments: ["NFC + QR readers", "Pacing controls", "Lane-aware throughput", "Hold-list overrides"] },
  { label: "05", title: "Drink tickets, redeemed quietly", body: "One pour per ticket, held in the wallet. The bar sees redemptions as they land, with manual entry and void for the edge cases.", moments: ["NFC tap to redeem", "Manual entry fallback", "Per-station counters", "Void + reissue"] },
  { label: "06", title: "After the night, the wrap", body: "A composed summary of arrival times, redemption pace, regret notes, and which guests the host should write to first.", moments: ["Arrival timeline", "Redemption pace", "Notes from the floor", "Follow-up shortlist"] },
];

export default function Platform() {
  return (
    <MktLayout>
      <PageHero
        eyebrow="The platform"
        title={<>Everything the host needs.<br /><span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>Nothing</span> the guest sees.</>}
        lede="Sera Society is the private layer behind a well-run evening — invitations, lists, RSVPs, check-in, drink tickets. Front-of-house finish, mission-critical infrastructure underneath."
      >
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/request-access" className="mkt-btn mkt-btn--primary">Request an introduction</Link>
          <Link to="/event-pages" className="mkt-btn mkt-btn--ghost-dark">See an event page</Link>
        </div>
      </PageHero>

      {/* Editorial table of contents */}
      <section style={{ background: "var(--mkt-cream)", padding: "120px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 80, marginBottom: 80 }}
            className="block md:grid"
          >
            <div>
              <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>In the room</span>
              <h2
                style={{
                  margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
                  fontSize: "clamp(2rem,4vw,3.6rem)", lineHeight: 0.98,
                  letterSpacing: "-0.04em", color: "var(--mkt-navy)",
                }}
              >
                Six rooms<br /><span style={{ fontStyle: "italic" }}>under</span> one roof.
              </h2>
            </div>
            <div>
              <p
                style={{
                  margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic",
                  fontSize: "1.3rem", lineHeight: 1.5, color: "rgba(18,16,14,0.78)", maxWidth: 540,
                }}
              >
                Each surface of Sera is shaped by one principle: the host stays composed,
                and the guest never sees the machinery.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {capabilities.map((c, i) => (
              <article
                key={c.label}
                style={{
                  display: "grid", gridTemplateColumns: "100px 1.4fr 1fr",
                  gap: 48, alignItems: "start",
                  padding: "44px 0",
                  borderTop: "1px solid var(--mkt-brass-30)",
                }}
                className="block md:grid"
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.2em", color: "var(--mkt-brass)" }}>
                  0{i + 1} / 06
                </span>
                <div>
                  <h3
                    style={{
                      margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
                      fontSize: "clamp(1.6rem,2.8vw,2.4rem)", lineHeight: 1.04,
                      letterSpacing: "-0.03em", color: "var(--mkt-navy)",
                    }}
                  >
                    {c.title}
                  </h3>
                  <p style={{ margin: "16px 0 0", fontFamily: "var(--font-sans)", fontSize: "1rem", lineHeight: 1.65, color: "rgba(18,16,14,0.74)", maxWidth: 540, textWrap: "pretty" as CSSProperties["textWrap"] }}>
                    {c.body}
                  </p>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, borderLeft: "1px solid var(--mkt-brass-30)", paddingLeft: 22 }}>
                  {c.moments.map((m) => (
                    <li key={m} style={{ fontFamily: "var(--font-sans)", fontSize: "0.86rem", color: "var(--mkt-navy)", opacity: 0.86 }}>{m}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet quote */}
      <section style={{ background: "var(--mkt-navy)", padding: "120px 40px", borderTop: "1px solid var(--mkt-brass-30)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
              fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.15,
              letterSpacing: "-0.025em", color: "var(--mkt-cream)",
              textWrap: "balance" as CSSProperties["textWrap"],
            }}
          >
            "We don't sell software. <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>We carry</span> the parts of an evening the host shouldn't have to."
          </p>
          <p style={{ margin: "28px 0 0", fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>
            — From the house manual
          </p>
        </div>
      </section>
    </MktLayout>
  );
}
