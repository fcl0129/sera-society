import { Link } from "react-router-dom";

const footerLinkClass =
  "transition-colors hover:text-[hsl(var(--sera-ink-brown))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sera-deep-moss))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--sera-ivory-paper))] rounded-sm";

export default function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--sera-warm-stone)/0.7)] bg-[hsl(var(--sera-ivory-paper))] text-[hsl(var(--sera-ink-brown)/0.8)]">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">Sera Society</p>
            <h3 className="max-w-xl font-serif text-4xl font-medium leading-[1] text-[hsl(var(--sera-ink-brown))] md:text-5xl">
              A private home for considered hosting.
            </h3>
            <p className="mt-5 max-w-xl text-[hsl(var(--sera-ink-brown)/0.72)]">
              Invitations, guest flow, and event rhythm composed as one brand world — calm, precise, and memorable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="mb-4 text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/platform" className={footerLinkClass}>Platform</Link></li>
                <li><Link to="/invitations" className={footerLinkClass}>Invitations</Link></li>
                <li><Link to="/event-pages" className={footerLinkClass}>Event Pages</Link></li>
                <li><Link to="/login" className={footerLinkClass}>Sign in</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm tracking-[0.08em] text-[hsl(var(--sera-deep-moss))]">Society</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className={footerLinkClass}>About</Link></li>
                <li><Link to="/faq" className={footerLinkClass}>FAQ</Link></li>
                <li><Link to="/contact" className={footerLinkClass}>Contact</Link></li>
                <li><Link to="/request-access" className={footerLinkClass}>Request Access</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-[hsl(var(--sera-warm-stone)/0.72)] pt-8 md:flex-row md:items-center">
          <p className="text-xs text-[hsl(var(--sera-ink-brown)/0.6)]">© {new Date().getFullYear()} Sera Society. All rights reserved.</p>
          <p className="text-xs tracking-[0.08em] text-[hsl(var(--sera-ink-brown)/0.58)]">For modern hosts and carefully made nights.</p>
        </div>
      </div>
    </footer>
  );
}
