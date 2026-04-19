import { Link } from "react-router-dom";

export function EventPageHeader() {
  return (
    <header className="px-6 py-6 md:px-10 md:py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <p className="sera-label text-[var(--event-text-secondary)]">Sera Society</p>
        <Link to="/invitations" className="text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)] transition hover:text-[var(--event-text-primary)]">
          Invitation gallery
        </Link>
      </div>
    </header>
  );
}
