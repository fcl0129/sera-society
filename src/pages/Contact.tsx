import { useState } from "react";
import MktLayout from "@/components/marketing/MktLayout";
import PageHero from "@/components/marketing/PageHero";

const fieldStyle = {
  padding: "14px 16px",
  background: "rgba(255,255,255,0.6)",
  border: "1px solid rgba(7,20,38,0.18)",
  borderRadius: 4,
  color: "var(--mkt-black)",
  fontFamily: "var(--font-sans)",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
};

function ContactRow({ label, lines, mono = false }: { label: string; lines: string[]; mono?: boolean }) {
  return (
    <div style={{ paddingBottom: 24, borderBottom: "1px solid var(--mkt-brass-30)" }}>
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-oxblood)" }}>{label}</p>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((l) => (
          <p key={l} style={{ margin: 0, fontFamily: mono ? "var(--font-mono)" : "var(--font-serif)", fontStyle: mono ? "normal" : "italic", fontSize: mono ? "0.94rem" : "1.05rem", letterSpacing: mono ? "0.02em" : "0", lineHeight: 1.55, color: "var(--mkt-black)" }}>{l}</p>
        ))}
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const upd = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <MktLayout>
      <PageHero
        eyebrow="In conversation"
        title={<>Write <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>to</span> the house.</>}
        lede="House replies are signed by hand, usually within a week. If your timing is tighter, mention it on the first line."
      />

      <section style={{ background: "var(--mkt-cream)", padding: "100px 40px", borderTop: "1px solid var(--mkt-brass-30)" }}>
        <div
          style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "start" }}
          className="block md:grid"
        >
          {/* Contact details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "sticky", top: 100 }}>
            <ContactRow label="House" lines={["house@serasociety.com"]} mono />
            <ContactRow label="Press" lines={["press@serasociety.com"]} mono />
            <ContactRow label="Partnerships" lines={["partners@serasociety.com"]} mono />
            <ContactRow label="Studio" lines={["Sera Society", "Stockholm", "Est. privately"]} />
            <ContactRow label="Hours" lines={["Mon — Fri", "09:00 — 18:00 CET", "We answer all hours during your event."]} />
          </div>

          {/* Form */}
          <div style={{ border: "1px solid var(--mkt-brass-30)", background: "rgba(255,255,255,0.55)", padding: 40 }}>
            {sent ? (
              <div style={{ padding: "40px 12px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(61,74,53,0.16)", border: "1px solid var(--mkt-moss)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mkt-moss)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <p style={{ margin: "24px 0 0", fontFamily: "var(--font-display)", fontSize: "1.6rem", letterSpacing: "-0.025em", color: "var(--mkt-navy)" }}>Your note is with the house.</p>
                <p style={{ margin: "12px auto 0", maxWidth: 380, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.55, color: "rgba(18,16,14,0.7)" }}>
                  We'll reply from house@serasociety.com. If we don't, it's our error, not yours — write again.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                style={{ display: "flex", flexDirection: "column", gap: 22 }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-oxblood)" }}>Your name</span>
                  <input
                    type="text" required value={form.name} onChange={(e) => upd("name")(e.target.value)}
                    placeholder="Fanny Hallencreutz" style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--mkt-navy)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(7,20,38,0.18)")}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-oxblood)" }}>Where to write back</span>
                  <input
                    type="email" required value={form.email} onChange={(e) => upd("email")(e.target.value)}
                    placeholder="you@your-house.com" style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--mkt-navy)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(7,20,38,0.18)")}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-oxblood)" }}>The note</span>
                  <textarea
                    required rows={5} value={form.message} onChange={(e) => upd("message")(e.target.value)}
                    placeholder="A sentence on what you'd like to talk about."
                    style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--mkt-navy)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(7,20,38,0.18)")}
                  />
                </label>
                <button type="submit" className="mkt-btn mkt-btn--primary" style={{ alignSelf: "flex-start", marginTop: 8 }}>
                  Send the note
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MktLayout>
  );
}
