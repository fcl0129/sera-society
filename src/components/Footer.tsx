import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-sera-navy text-sera-sand">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h3 className="font-serif text-xl font-light text-sera-ivory mb-4">Sera Society</h3>
            <p className="sera-body text-sm text-sera-stone leading-relaxed">
              A private layer for modern events. For those who host differently.
            </p>
          </div>
          <div>
            <h4 className="sera-label text-sera-ivory mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/platform" className="hover:text-sera-ivory transition-colors">Features</Link></li>
              <li><Link to="/invitations" className="hover:text-sera-ivory transition-colors">Invitations</Link></li>
              <li><Link to="/event-pages" className="hover:text-sera-ivory transition-colors">Event Pages</Link></li>
              <li><Link to="/check-in" className="hover:text-sera-ivory transition-colors">Check-In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="sera-label text-sera-ivory mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-sera-ivory transition-colors">About</Link></li>
              <li><Link to="/faq" className="hover:text-sera-ivory transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-sera-ivory transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="sera-label text-sera-ivory mb-4">Access</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-sera-ivory transition-colors">Organizer Login</Link></li>
              <li><Link to="/request-access" className="hover:text-sera-ivory transition-colors">Request Access</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-sera-ink flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-sera-stone">© {new Date().getFullYear()} Sera Society. All rights reserved.</p>
          <p className="text-xs text-sera-stone italic font-serif">Better late than ordinary.</p>
        </div>
      </div>
    </footer>
  );
}
