import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
  const isHome = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isHome
          ? "bg-sera-deep-navy/70 border-sera-ivory/10 backdrop-blur-xl"
          : "bg-sera-ivory/95 border-sera-navy/10 backdrop-blur-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 pt-2 pb-4">
        <div
          className={`hidden md:flex items-center justify-between mb-3 text-[10px] tracking-[0.16em] uppercase ${
            isHome ? "text-sera-sand/70" : "text-sera-warm-grey"
          }`}
        >
          <span>Curated Event Infrastructure</span>
          <span>New York · London · Paris</span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <Link to="/" className="flex flex-col leading-none">
            <span
              className={`font-serif text-2xl font-light tracking-[0.04em] ${
                isHome ? "text-sera-ivory" : "text-sera-navy"
              }`}
            >
              Sera Society
            </span>
            <span
              className={`text-[10px] tracking-[0.18em] uppercase mt-1 ${
                isHome ? "text-sera-sand/70" : "text-sera-warm-grey"
              }`}
            >
              Edition 01
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`sera-label transition-colors ${
                  isHome
                    ? "text-sera-sand/85 hover:text-sera-ivory"
                    : "text-sera-navy/70 hover:text-sera-navy"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant={isHome ? "sera-ivory" : "sera-outline"} size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="sera-accent" size="sm" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden ${isHome ? "text-sera-ivory" : "text-sera-navy"}`}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t overflow-hidden ${
              isHome ? "bg-sera-deep-navy border-sera-ink" : "bg-sera-ivory border-sera-navy/10"
            }`}
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className={`sera-label transition-colors py-2 ${
                    isHome
                      ? "text-sera-sand hover:text-sera-ivory"
                      : "text-sera-warm-grey hover:text-sera-navy"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className={`pt-4 border-t flex flex-col gap-3 ${isHome ? "border-sera-ink" : "border-sera-navy/10"}`}>
                <Button variant={isHome ? "sera-ivory" : "sera-outline"} asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>
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
    </nav>
  );
}
