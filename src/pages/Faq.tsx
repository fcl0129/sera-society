import { useState } from "react";
import { Link } from "react-router-dom";
import MktLayout from "@/components/marketing/MktLayout";
import PageHero from "@/components/marketing/PageHero";
import SectionTransition from "@/components/marketing/SectionTransition";

const faqs = [
  {
    section: "On the platform",
    items: [
      ["Who is Sera Society for?", "Hosts running curated evenings — private dinners, brand events, celebrations, gatherings where the room is invited, not advertised. If your event has a guest list and a tone, Sera is for you."],
      ["Is Sera a ticketing platform?", "No. Sera does not sell tickets to the public. Every event is reachable only through a signed, private link. We are infrastructure for hosts, not a marketplace."],
      ["What size events does Sera handle?", "From a ten-seat dinner to three-hundred-guest receptions. The check-in and bar layers are built to absorb pressure without breaking pacing."],
      ["Can guests use Sera without an account?", "Yes. The invitation, RSVP, and pass all live behind a per-guest link. Guests open it on their phone and never sign up for anything."],
    ],
  },
  {
    section: "On the evening",
    items: [
      ["How does check-in actually work?", "NFC and QR, side by side, at the door. The host's staff scans from any modern phone or tablet — no special hardware. Hold-list overrides happen in two taps."],
      ["What about drink tickets?", "Each accepted guest gets one or more passes. The bar reads them via NFC or QR. Manual entry exists for the edge cases, and tickets can be voided or reissued without leaving the bar view."],
      ["Can I match my brand or house style?", "Yes. The invitation cover, event page, and pass all accept your typography, color, and host voice — within the editorial spine Sera is built on. We are not a logo-on-template tool."],
      ["What happens after the night?", "A wrap summary — arrival timeline, redemption pace, regret notes, and a shortlist of guests worth writing to first. Composed, not spreadsheet."],
    ],
  },
  {
    section: "On the house",
    items: [
      ["How is Sera priced?", "By introduction. Pricing is shaped to the scale and frequency of your evenings — we'll talk it through in your first reply."],
      ["Is my data private?", "Yes. No public listings, no indexable pages, no sharing with third parties. Guest data is held only as long as you need it for the event and the wrap."],
      ["Who reads my access request?", "I do, by hand. Usually within a week. — Fanny"],
      ["Can I see a working evening before applying?", "Yes — write to the house and we'll send you to a live demo."],
    ],
  },
];

export default function Faq() {
  const [open, setOpen] = useState<Record<string, boolean>>({ "On the platform-0": true });
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  return (
    <MktLayout>
      <PageHero
        eyebrow="Plainly answered"
        title={<>Questions, <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>before</span> the night.</>}
        lede="If something isn't here, write to the house — we'll answer in plain language and add it for the next reader."
      >
        <Link to="/contact" className="mkt-btn mkt-btn--ghost-dark">Write to the house</Link>
      </PageHero>

      <SectionTransition from="navy" to="cream" />

      <section style={{ background: "var(--mkt-cream)", padding: "100px 40px" }}>
        <div
          style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}
          className="block md:grid"
        >
          {/* Sidebar */}
          <aside style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 18 }}>
            <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>Sections</span>
            {faqs.map((f) => (
              <a
                key={f.section}
                href={`#${f.section.replace(/\s+/g, "-")}`}
                style={{
                  display: "block", paddingTop: 14, borderTop: "1px solid var(--mkt-brass-30)",
                  fontFamily: "var(--font-display)", fontSize: "1.4rem", letterSpacing: "-0.02em",
                  color: "var(--mkt-navy)", textDecoration: "none", lineHeight: 1.1,
                }}
              >
                {f.section}
                <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--mkt-brass)" }}>
                  ({f.items.length})
                </span>
              </a>
            ))}
          </aside>

          {/* Q&A */}
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {faqs.map((f) => (
              <section key={f.section} id={f.section.replace(/\s+/g, "-")}>
                <span className="mkt-eyebrow" style={{ color: "var(--mkt-oxblood)" }}>{f.section}</span>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column" }}>
                  {f.items.map(([q, a], i) => {
                    const key = `${f.section}-${i}`;
                    const isOpen = open[key];
                    return (
                      <article
                        key={q}
                        style={{
                          borderTop: "1px solid var(--mkt-brass-30)",
                          borderBottom: i === f.items.length - 1 ? "1px solid var(--mkt-brass-30)" : "none",
                        }}
                      >
                        <button
                          onClick={() => toggle(key)}
                          style={{
                            width: "100%", textAlign: "left",
                            background: "transparent", border: 0, cursor: "pointer",
                            padding: "22px 0",
                            display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16,
                            color: "var(--mkt-navy)",
                          }}
                        >
                          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.35rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{q}</h3>
                          <span
                            style={{
                              width: 28, height: 28, borderRadius: 999,
                              border: "1px solid var(--mkt-brass-30)",
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              color: "var(--mkt-brass)", fontFamily: "var(--font-mono)", fontSize: "1rem",
                              transition: "transform 200ms cubic-bezier(0.22,1,0.36,1)",
                              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                            }}
                          >+</span>
                        </button>
                        <div style={{ maxHeight: isOpen ? 400 : 0, overflow: "hidden", transition: "max-height 320ms cubic-bezier(0.22,1,0.36,1)" }}>
                          <p style={{ margin: 0, paddingBottom: 24, fontFamily: "var(--font-serif)", fontSize: "1.05rem", lineHeight: 1.65, color: "rgba(18,16,14,0.78)", maxWidth: 640 }}>{a}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SectionTransition from="cream" to="navy" />

      <section style={{ background: "var(--mkt-navy)", padding: "80px 40px" }}>
        <div
          style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}
          className="block md:grid"
        >
          <div>
            <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>If your question isn't here</span>
            <h3 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(1.6rem,3.2vw,2.6rem)", lineHeight: 1, letterSpacing: "-0.03em", color: "var(--mkt-cream)" }}>
              Write to the house. We'll add it for the next reader.
            </h3>
          </div>
          <Link to="/contact" className="mkt-btn mkt-btn--primary">Write to the house</Link>
        </div>
      </section>
    </MktLayout>
  );
}
