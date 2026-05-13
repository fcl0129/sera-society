import { Link } from "react-router-dom";

const sections = [
  {
    heading: "Platform",
    links: [
      { label: "Platform overview", to: "/platform" },
      { label: "Event pages", to: "/event-pages" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    heading: "Society",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Request an introduction", to: "/request-access" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", to: null },
      { label: "Privacy", to: null },
      { label: "Accessibility", to: null },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--mkt-navy)",
        color: "var(--mkt-cream)",
        padding: "72px 40px 36px",
        borderTop: "1px solid var(--mkt-brass-30)",
      }}
    >
      <div
        style={{
          maxWidth: 1280, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 48,
        }}
        className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]"
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)", fontSize: "2.2rem", fontWeight: 500,
              letterSpacing: "-0.03em",
            }}
          >
            Sera <span style={{ fontStyle: "italic", color: "var(--mkt-brass)" }}>Society</span>
          </div>
          <p
            style={{
              margin: "18px 0 0", maxWidth: 320,
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: "1.05rem", lineHeight: 1.5, color: "var(--mkt-smoke)",
            }}
          >
            The private layer behind unforgettable events.
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.heading}>
            <p
              style={{
                margin: "0 0 18px",
                fontFamily: "var(--font-sans)", fontSize: "0.66rem",
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--mkt-brass)",
              }}
            >
              {s.heading}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {s.links.map(({ label, to }) => (
                <li key={label}>
                  {to ? (
                    <Link
                      to={to}
                      style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.88rem",
                        color: "var(--mkt-cream)", opacity: 0.78, textDecoration: "none",
                        transition: "opacity 160ms",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.78")}
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.88rem",
                        color: "var(--mkt-cream)", opacity: 0.4,
                      }}
                    >
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1280, margin: "56px auto 0", paddingTop: 24,
          borderTop: "1px solid var(--mkt-cream-14)",
          display: "flex", justifyContent: "space-between",
          fontFamily: "var(--font-mono)", fontSize: "0.66rem",
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--mkt-brass)",
        }}
      >
        <span>© Sera Society · {new Date().getFullYear()}</span>
        <span>Est. privately · Stockholm / Paris</span>
      </div>
    </footer>
  );
}
