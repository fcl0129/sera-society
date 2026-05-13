import { useState } from "react";
import { Link } from "react-router-dom";
import MktLayout from "@/components/marketing/MktLayout";

type FormData = {
  name: string; email: string; role: string;
  house: string; city: string;
  kind: string; scale: string; intro: string;
};

const inputStyle = {
  padding: "14px 16px",
  background: "rgba(244,235,221,0.04)",
  border: "1px solid var(--mkt-cream-14)",
  borderRadius: 4,
  color: "var(--mkt-cream)",
  fontFamily: "var(--font-sans)",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
};

function Field({
  label, value, onChange, placeholder, type = "text", textarea = false, options,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; textarea?: boolean; options?: string[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mkt-brass)" }}>{label}</span>
      {textarea ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--mkt-brass)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--mkt-cream-14)")}
        />
      ) : options ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {options.map((o) => (
            <button
              key={o} type="button" onClick={() => onChange(o)}
              style={{
                padding: "10px 16px",
                background: value === o ? "var(--mkt-oxblood)" : "transparent",
                border: `1px solid ${value === o ? "var(--mkt-oxblood)" : "var(--mkt-cream-32)"}`,
                borderRadius: 999, color: "var(--mkt-cream)",
                fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
                transition: "all 160ms",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--mkt-brass)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--mkt-cream-14)")}
        />
      )}
    </label>
  );
}

const steps = [
  { label: "Who you are", n: "01" },
  { label: "The house", n: "02" },
  { label: "The evenings", n: "03" },
];

export default function RequestAccess() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ name: "", email: "", role: "", house: "", city: "", kind: "Private dinners", scale: "10–40", intro: "" });
  const [done, setDone] = useState(false);
  const upd = (k: keyof FormData) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <MktLayout>
      <div
        style={{
          minHeight: "100vh", background: "var(--mkt-navy)",
          position: "relative", overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(circle at 14% 16%, rgba(90,18,24,0.32), transparent 38%),
              radial-gradient(circle at 88% 30%, rgba(169,132,92,0.16), transparent 36%),
              linear-gradient(180deg, #071426 0%, #0D1B2E 100%)
            `,
          }}
        />

        <div
          style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "180px 40px 96px", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "start" }}
          className="block md:grid"
        >
          {/* Left — context */}
          <div style={{ position: "sticky", top: 120 }}>
            <span className="mkt-eyebrow" style={{ color: "var(--mkt-brass)" }}>Request an introduction</span>
            <h1
              style={{
                margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 500,
                fontSize: "clamp(2.4rem,5vw,4.2rem)", lineHeight: 0.94,
                letterSpacing: "-0.045em", color: "var(--mkt-cream)",
              }}
            >
              Tell us about <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>your</span> evenings.
            </h1>
            <p style={{ margin: "24px 0 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.55, color: "var(--mkt-smoke)", maxWidth: 360 }}>
              Three short questions. We read every introduction by hand, usually within a week.
            </p>

            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 0 }}>
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  style={{
                    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center",
                    padding: "16px 0", borderTop: "1px solid var(--mkt-brass-30)",
                    color: step === i ? "var(--mkt-cream)" : "var(--mkt-smoke)",
                    opacity: step >= i || done ? 1 : 0.5, transition: "all 200ms",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.18em", color: step === i ? "var(--mkt-brass)" : "var(--mkt-smoke)" }}>{s.n}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", letterSpacing: "-0.02em" }}>{s.label}</span>
                  {(step > i || done) && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--mkt-moss)", letterSpacing: "0.18em" }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ border: "1px solid var(--mkt-cream-14)", background: "rgba(7,20,38,0.45)", padding: 40, backdropFilter: "blur(20px)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(61,74,53,0.2)", border: "1px solid var(--mkt-moss)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mkt-moss)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <h2 style={{ margin: "28px 0 0", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "2.2rem", letterSpacing: "-0.035em", color: "var(--mkt-cream)" }}>The note is on the way.</h2>
                <p style={{ margin: "16px auto 0", maxWidth: 380, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.55, color: "var(--mkt-smoke)" }}>
                  We'll write back from house@serasociety.com, usually within a week. If your timing is tighter than that, mention it in your reply.
                </p>
                <div style={{ marginTop: 32 }}>
                  <Link to="/" className="mkt-btn mkt-btn--ghost-dark">Return to the door</Link>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  {step === 0 && (
                    <>
                      <Field label="Your name" value={form.name} onChange={upd("name")} placeholder="Hélène Marchand" />
                      <Field label="Where to write back" value={form.email} onChange={upd("email")} placeholder="helene@maisoncordeau.com" type="email" />
                      <Field label="Your role" value={form.role} onChange={upd("role")} placeholder="Host · curator · brand director" />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <Field label="The house or studio" value={form.house} onChange={upd("house")} placeholder="Maison Cordeau · Atelier · independent" />
                      <Field label="City" value={form.city} onChange={upd("city")} placeholder="Stockholm" />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Field label="What kind of evenings" value={form.kind} onChange={upd("kind")} options={["Private dinners", "Brand events", "Celebrations", "Curated gatherings"]} />
                      <Field label="Typical room size" value={form.scale} onChange={upd("scale")} options={["10–40", "40–120", "120–300", "300+"]} />
                      <Field label="A short introduction" value={form.intro} onChange={upd("intro")} placeholder="A sentence on what you host, and why Sera." textarea />
                    </>
                  )}
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--mkt-brass-30)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.18em", color: "var(--mkt-brass)", whiteSpace: "nowrap" }}>
                    {step + 1} / 3
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    {step > 0 && <button type="button" className="mkt-btn mkt-btn--ghost-dark" onClick={() => setStep((s) => s - 1)}>Back</button>}
                    {step < 2 && <button type="button" className="mkt-btn mkt-btn--primary" onClick={() => setStep((s) => s + 1)}>Continue</button>}
                    {step === 2 && <button type="button" className="mkt-btn mkt-btn--primary" onClick={() => setDone(true)}>Send the note</button>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MktLayout>
  );
}
