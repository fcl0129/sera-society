import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-sera-charcoal text-sera-sand border-t border-sera-ink/70">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 mb-12">
          <div>
            <p className="sera-label text-sera-stone mb-4">Sera Society</p>
            <h3 className="font-serif text-4xl md:text-5xl font-light text-sera-ivory leading-[1.02] mb-6">
              Built for hosts who treat
              <br />
              events like publications.
            </h3>
            <p className="sera-body text-sera-stone max-w-xl">
              We design tools for teams that value curation, control, and unforgettable guest
              experience from the first touchpoint to the final toast.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="sera-label text-sera-ivory mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/platform" className="hover:text-sera-ivory transition-colors">Platform</Link></li>
                <li><Link to="/invitations" className="hover:text-sera-ivory transition-colors">Invitations</Link></li>
                <li><Link to="/event-pages" className="hover:text-sera-ivory transition-colors">Event Pages</Link></li>
                <li><Link to="/check-in" className="hover:text-sera-ivory transition-colors">Check-In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="sera-label text-sera-ivory mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-sera-ivory transition-colors">About</Link></li>
                <li><Link to="/faq" className="hover:text-sera-ivory transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-sera-ivory transition-colors">Contact</Link></li>
                <li><Link to="/request-access" className="hover:text-sera-ivory transition-colors">Request Access</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-sera-ink/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="text-xs text-sera-stone">© {new Date().getFullYear()} Sera Society. All rights reserved.</p>
          <p className="text-xs text-sera-stone tracking-[0.1em] uppercase">Designed for distinct experiences.</p>
        </div>
      </div>
    </footer>
  );
}
