import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Platform", href: "/platform" },
  { label: "Invitations", href: "/invitations" },
  { label: "Event Pages", href: "/event-pages" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const mobileMenuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 md:pt-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[hsl(var(--sera-soft-blush))] focus:px-3 focus:py-2 focus:text-[hsl(var(--sera-ink-brown))]"
      >
        Skip to main content
      </a>

      <div className="mx-auto w-full max-w-6xl rounded-full border border-[hsl(var(--sera-warm-stone)/0.72)] bg-[hsl(var(--sera-ivory-paper)/0.88)] px-4 py-2.5 shadow-[0_10px_28px_-22px_rgba(42,36,33,0.48)] backdrop-blur-sm md:px-6">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[auto_1fr_auto] md:gap-8">
          <Link to="/" className="text-[1.22rem] tracking-[0.01em] text-[hsl(var(--sera-ink-brown))] md:text-[1.35rem]">
            Sera Society
          </Link>

          <nav className="hidden justify-center gap-8 md:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sera-deep-moss))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sera-ivory-paper))] ${
                    isActive
                      ? "text-[hsl(var(--sera-ink-brown))]"
                      : "text-[hsl(var(--sera-ink-brown)/0.72)] hover:text-[hsl(var(--sera-ink-brown))]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[hsl(var(--sera-ink-brown)/0.82)] hover:bg-[hsl(var(--sera-soft-blush)/0.58)]">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-[hsl(var(--sera-ink-brown))] px-4 text-[hsl(var(--sera-ivory-paper))] hover:bg-[hsl(var(--sera-ink-brown)/0.94)]">
              <Link to="/request-access">Request Access</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-md p-1 text-[hsl(var(--sera-ink-brown))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sera-deep-moss))] md:hidden"
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
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={shouldReduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden border-t border-[hsl(var(--sera-warm-stone)/0.72)]"
            >
              <div className="flex flex-col gap-2 pt-3">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-md px-1 py-2 text-sm ${
                        isActive ? "text-[hsl(var(--sera-ink-brown))]" : "text-[hsl(var(--sera-ink-brown)/0.76)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-2 flex flex-col gap-2 border-t border-[hsl(var(--sera-warm-stone)/0.72)] pt-3">
                  <Button asChild variant="ghost" className="justify-start rounded-full text-[hsl(var(--sera-ink-brown))] hover:bg-[hsl(var(--sera-soft-blush)/0.58)]">
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild className="rounded-full bg-[hsl(var(--sera-ink-brown))] text-[hsl(var(--sera-ivory-paper))] hover:bg-[hsl(var(--sera-ink-brown)/0.94)]">
                    <Link to="/request-access" onClick={() => setOpen(false)}>
                      Request Access
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
