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

      {/* Unified header — wordmark + CTAs + burger at every breakpoint */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px clamp(16px, 4vw, 40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
            fontWeight: 500,
            color: N.cream,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          Sera <span style={{ color: N.brass, fontStyle: "italic" }}>Society</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link
            to="/login"
            className="hidden sm:inline-flex"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: N.cream,
              opacity: 0.72,
              textDecoration: "none",
              whiteSpace: "nowrap",
              padding: "0 10px",
            }}
          >
            Return to your studio
          </Link>
          <Link
            to="/request-access"
            className="mkt-btn mkt-btn--primary"
            style={{ whiteSpace: "nowrap", fontSize: "0.72rem", padding: "10px 16px" }}
          >
            <span className="hidden sm:inline">Request an introduction</span>
            <span className="sm:hidden">Request access</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            style={{
              background: "transparent",
              border: `1px solid ${N.cream14}`,
              color: N.cream,
              cursor: "pointer",
              padding: 8,
              borderRadius: 999,
              marginLeft: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Drawer (all breakpoints) */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: "hidden",
              borderTop: `1px solid ${N.cream14}`,
              background: "rgba(7,20,38,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div
              style={{
                maxWidth: 1280,
                margin: "0 auto",
                padding: "16px clamp(16px, 4vw, 40px) 28px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {PAGES.map((p) => (
                <Link
                  key={p.slug}
                  to={p.slug}
                  onClick={() => setOpen(false)}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    color: N.cream,
                    textDecoration: "none",
                    padding: "14px 0",
                    borderBottom: `1px solid ${N.cream08}`,
                    opacity: location.pathname === p.slug ? 1 : 0.72,
                  }}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
