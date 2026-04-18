import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";

const navLinks = [
  { label: "Platform", href: "/platform" },
  { label: "Invitations", href: "/invitations" },
  { label: "Event Pages", href: "/event-pages" },
  { label: "Check-In", href: "/check-in" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const mobileMenuId = useId();
  const mobileMenuAnimation = shouldReduceMotion
    ? { opacity: 1, height: "auto" as const }
    : { opacity: 0, height: 0 };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-sera-accent focus:px-3 focus:py-2 focus:text-sera-ink"
      >
        Skip to main content
      </a>

      <Glass
        strength="strong"
        glow
        className="mx-auto w-full max-w-7xl border-white/20 bg-sera-deep-navy/65 px-4 py-3 md:px-6 transition-colors duration-200 hover:border-white/30"
      >
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-serif text-xl font-light tracking-[0.03em] text-sera-ivory md:text-2xl">
              Sera Society
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-sera-sand/75">
              Event Operations System
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200/95">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200 motion-reduce:animate-none" />
              Live
            </span>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`sera-label relative rounded-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-sera-ivory/70 after:transition-transform after:duration-200 ${
                    isActive
                      ? "text-sera-ivory after:scale-x-100"
                      : "text-sera-sand/80 hover:text-sera-ivory after:scale-x-0 hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="sera-outline" size="sm" className="transition-transform duration-200 hover:-translate-y-0.5" asChild>
              <Link to="/login" className="border-sera-ivory/60 text-sera-ivory hover:bg-sera-ivory hover:text-sera-navy">
                Log in
              </Link>
            </Button>
            <Button variant="sera-accent" size="sm" className="transition-transform duration-200 hover:-translate-y-0.5" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-sm text-sera-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls={mobileMenuId}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id={mobileMenuId}
              initial={shouldReduceMotion ? false : mobileMenuAnimation}
              animate={{ opacity: 1, height: "auto" }}
              exit={mobileMenuAnimation}
              className="mt-4 overflow-hidden border-t border-white/15"
            >
              <div className="flex flex-col gap-3 pt-4">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`sera-label rounded-sm py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy ${
                        isActive ? "text-sera-ivory" : "text-sera-sand hover:text-sera-ivory"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
                  <Button variant="sera-outline" asChild>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="border-sera-ivory/60 text-sera-ivory hover:bg-sera-ivory hover:text-sera-navy"
                    >
                      Log in
                    </Link>
                  </Button>
                  <Button variant="sera-accent" asChild>
                    <Link to="/request-access" onClick={() => setOpen(false)}>
                      Request Access
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Glass>
    </header>
  );
}
