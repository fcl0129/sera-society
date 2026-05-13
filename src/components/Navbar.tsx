import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PAGES = [
  { slug: "/platform",    label: "Platform" },
  { slug: "/event-pages", label: "Event pages" },
  { slug: "/about",       label: "About" },
  { slug: "/faq",         label: "FAQ" },
  { slug: "/contact",     label: "Contact" },
];

const N = {
  navy:     "var(--mkt-navy)",
  cream:    "var(--mkt-cream)",
  brass:    "var(--mkt-brass)",
  cream14:  "var(--mkt-cream-14)",
  cream32:  "var(--mkt-cream-32)",
  cream08:  "var(--mkt-cream-08)",
  cream72:  "var(--mkt-cream-72)",
  oxblood:  "var(--mkt-oxblood)",
  smoke:    "var(--mkt-smoke)",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header
      style={{
        position: isLanding ? "absolute" : "sticky",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: isLanding
          ? "transparent"
          : "rgba(7,20,38,0.82)",
        borderBottom: isLanding
          ? "1px solid transparent"
          : `1px solid ${N.cream14}`,
        backdropFilter: isLanding ? "none" : "blur(24px)",
        WebkitBackdropFilter: isLanding ? "none" : "blur(24px)",
      }}
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#F4EBDD] focus:px-3 focus:py-2 focus:text-[#071426]"
      >
        Skip to main content
      </a>

      {/* Desktop nav */}
      <div
        style={{
          maxWidth: 1280, margin: "0 auto", padding: "20px 40px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center", gap: 32,
        }}
        className="hidden md:grid"
      >
        {/* Wordmark */}
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 500,
            color: N.cream, textDecoration: "none", letterSpacing: "-0.01em",
          }}
        >
          Sera <span style={{ color: N.brass, fontStyle: "italic" }}>Society</span>
        </Link>

        {/* Links */}
        <nav style={{ display: "flex", justifyContent: "center", gap: 36 }}>
          {PAGES.map((p) => {
            const active = location.pathname === p.slug;
            return (
              <Link
                key={p.slug}
                to={p.slug}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 450,
                  letterSpacing: "0.02em", color: N.cream,
                  opacity: active ? 1 : 0.7, textDecoration: "none",
                  borderBottom: active ? `1px solid ${N.brass}` : "1px solid transparent",
                  paddingBottom: 4, transition: "all 200ms",
                }}
              >
                {p.label}
              </Link>
            );
          })}
        </nav>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            to="/login"
            style={{
              fontFamily: "var(--font-sans)", fontSize: "0.74rem", letterSpacing: "0.18em",
              textTransform: "uppercase", color: N.cream, opacity: 0.72,
              textDecoration: "none", whiteSpace: "nowrap", padding: "0 12px",
            }}
          >
            Return to your studio
          </Link>
          <Link to="/request-access" className="mkt-btn mkt-btn--primary">
            Request an introduction
          </Link>
        </div>
      </div>

      {/* Mobile header */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
        }}
        className="md:hidden"
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 500,
            color: N.cream, textDecoration: "none",
          }}
        >
          Sera <span style={{ color: N.brass, fontStyle: "italic" }}>Society</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          style={{
            background: "transparent", border: "none", color: N.cream,
            cursor: "pointer", padding: 4,
          }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", borderTop: `1px solid ${N.cream14}` }}
            className="md:hidden"
          >
            <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
              {PAGES.map((p) => (
                <Link
                  key={p.slug}
                  to={p.slug}
                  onClick={() => setOpen(false)}
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.9rem",
                    color: N.cream, textDecoration: "none",
                    padding: "10px 0",
                    borderBottom: `1px solid ${N.cream08}`,
                    opacity: location.pathname === p.slug ? 1 : 0.72,
                  }}
                >
                  {p.label}
                </Link>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                <Link to="/login" onClick={() => setOpen(false)} className="mkt-btn mkt-btn--ghost-dark" style={{ textAlign: "center" }}>
                  Return to your studio
                </Link>
                <Link to="/request-access" onClick={() => setOpen(false)} className="mkt-btn mkt-btn--primary" style={{ textAlign: "center" }}>
                  Request an introduction
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
