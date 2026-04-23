import { Link } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";

const footerLinkClass = "text-[#d9cdbd]/78 transition-colors duration-200 hover:text-[#f0e5d6]";

export default function Footer() {
  return (
    <footer className="border-t border-[#e4d5c1]/15 pb-12 pt-14 text-[#d8ccbb] md:pb-16 md:pt-16">
      <SeraContainer>
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div className="space-y-4">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#d9ccbc]/72">Sera Society</p>
            <h3 className="max-w-lg font-display text-[clamp(1.8rem,4vw,3.3rem)] leading-[0.94] tracking-[-0.02em] text-[#f2e8da]">
              A considered home for evenings that matter.
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[0.77rem] uppercase tracking-[0.14em]">
            <ul className="space-y-3">
              <li><Link to="/platform" className={footerLinkClass}>Platform</Link></li>
              <li><Link to="/invitations" className={footerLinkClass}>Invitations</Link></li>
              <li><Link to="/event-pages" className={footerLinkClass}>Event pages</Link></li>
            </ul>
            <ul className="space-y-3">
              <li><Link to="/about" className={footerLinkClass}>About</Link></li>
              <li><Link to="/faq" className={footerLinkClass}>FAQ</Link></li>
              <li><Link to="/contact" className={footerLinkClass}>Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#e4d5c1]/15 pt-6 text-[0.72rem] text-[#d0c2b1]/68 md:flex md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sera Society</p>
          <p>Quietly composed for modern hosts.</p>
        </div>
      </SeraContainer>
    </footer>
  );
}
