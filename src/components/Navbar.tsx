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
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 md:pt-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-sera-accent focus:px-3 focus:py-2 focus:text-sera-ink"
      >
        Skip to main content
      </a>

      <Glass
        strength="medium"
        className="mx-auto w-full max-w-6xl border-white/15 bg-sera-deep-navy/52 px-4 py-2.5 md:px-5 md:py-3 transition-colors duration-200 hover:border-white/20"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-8">
          <Link to="/" className="flex min-w-0 items-baseline gap-2.5 leading-none md:justify-self-start">
            <span className="truncate font-serif text-[1.18rem] font-normal tracking-[0.02em] text-sera-ivory md:text-[1.32rem]">
              Sera Society
            </span>
            <span className="hidden text-[9px] uppercase tracking-[0.18em] text-sera-sand/65 lg:inline">
              Event Operations
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-7 md:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`sera-label relative rounded-sm text-[0.66rem] tracking-[0.16em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-sera-ivory/65 after:transition-transform after:duration-200 ${
                    isActive
                      ? "text-sera-ivory after:scale-x-100"
                      : "text-sera-sand/75 hover:text-sera-ivory after:scale-x-0 hover:after:scale-x-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-end gap-2.5 md:flex">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sera-sand/85 hover:bg-white/5 hover:text-sera-ivory" asChild>
              <Link to="/login" className="sera-label text-[0.64rem] tracking-[0.14em]">
                Log in
              </Link>
            </Button>
            <Button
              variant="sera-accent"
              size="sm"
              className="h-8 rounded-full border border-white/10 bg-sera-oxblood/90 px-4 text-[0.72rem] tracking-[0.06em] text-sera-ivory shadow-none transition-colors duration-200 hover:bg-sera-oxblood-soft"
              asChild
            >
              <Link to="/request-access">Request Access</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-sm p-1 text-sera-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy md:hidden"
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
              className="mt-3 overflow-hidden border-t border-white/10"
            >
              <div className="flex flex-col gap-2.5 pt-3.5">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`sera-label rounded-sm py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-sera-deep-navy ${
                        isActive ? "text-sera-ivory" : "text-sera-sand/85 hover:text-sera-ivory"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-2 flex flex-col gap-2.5 border-t border-white/10 pt-3.5">
                  <Button variant="ghost" className="justify-start px-0 text-sera-sand/85 hover:bg-transparent hover:text-sera-ivory" asChild>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="sera-label"
                    >
                      Log in
                    </Link>
                  </Button>
                  <Button
                    variant="sera-accent"
                    className="h-9 rounded-full border border-white/10 bg-sera-oxblood/90 text-[0.72rem] tracking-[0.06em] shadow-none hover:bg-sera-oxblood-soft"
                    asChild
                  >
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
