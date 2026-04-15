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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isHome ? "bg-sera-navy/95 backdrop-blur-sm" : "bg-sera-navy"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-light tracking-wide text-sera-ivory">
            Sera Society
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="sera-label text-sera-sand hover:text-sera-ivory transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="sera-outline" size="sm" asChild>
            <Link to="/login" className="border-sera-sand text-sera-sand hover:bg-sera-ivory hover:text-sera-navy">
              Log in
            </Link>
          </Button>
          <Button variant="sera-accent" size="sm" asChild>
            <Link to="/request-access">Request Access</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-sera-ivory"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-sera-navy border-t border-sera-ink overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="sera-label text-sera-sand hover:text-sera-ivory transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-sera-ink flex flex-col gap-3">
                <Button variant="sera-outline" asChild>
                  <Link to="/login" onClick={() => setOpen(false)} className="border-sera-sand text-sera-sand hover:bg-sera-ivory hover:text-sera-navy">
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
