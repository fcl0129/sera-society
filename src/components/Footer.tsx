import { Link } from "react-router-dom";

const footerLinkClass =
  "transition-colors hover:text-sera-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sera-sand focus-visible:ring-offset-2 focus-visible:ring-offset-sera-charcoal rounded-sm";

export default function Footer() {
  return (
    <footer className="border-t border-sera-ink/70 bg-sera-charcoal text-sera-sand">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="sera-label mb-4 text-sera-stone">Sera Society</p>
            <h3 className="mb-6 font-serif text-4xl font-light leading-[1.02] text-sera-ivory md:text-5xl">
              Built for hosts who treat
              <br />
              events like publications.
            </h3>
            <p className="sera-body max-w-xl text-sera-stone">
              We design tools for teams that value curation, control, and unforgettable guest
              experience from the first touchpoint to the final toast.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="sera-label mb-4 text-sera-ivory">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/platform" className={footerLinkClass}>Platform</Link></li>
                <li><Link to="/invitations" className={footerLinkClass}>Invitations</Link></li>
                <li><Link to="/event-pages" className={footerLinkClass}>Event Pages</Link></li>
                <li><Link to="/check-in" className={footerLinkClass}>Check-In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="sera-label mb-4 text-sera-ivory">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className={footerLinkClass}>About</Link></li>
                <li><Link to="/faq" className={footerLinkClass}>FAQ</Link></li>
                <li><Link to="/contact" className={footerLinkClass}>Contact</Link></li>
                <li><Link to="/request-access" className={footerLinkClass}>Request Access</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-sera-ink/80 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-sera-stone">© {new Date().getFullYear()} Sera Society. All rights reserved.</p>
          <p className="text-xs uppercase tracking-[0.1em] text-sera-stone">Designed for distinct experiences.</p>
        </div>
      </div>
    </footer>
  );
}
