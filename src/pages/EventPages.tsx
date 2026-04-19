import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestFlowFrame from "@/components/guest/GuestFlowFrame";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock3, Info, MapPinned, Megaphone } from "lucide-react";
import { ReactNode } from "react";

const updates = [
  "6:40 PM: Doors open at north lobby.",
  "7:15 PM: Host welcome begins.",
  "9:10 PM: Main set starts.",
];

export default function EventPages() {
  return (
    <div className="min-h-screen bg-sera-surface-light">
      <Navbar />
      <GuestFlowFrame
        eyebrow="Event Page"
        title={
          <>
            One page for details,
            <br />
            <span className="italic text-sera-oxblood">updates, and action</span>
          </>
        }
        description="Guests should not hunt for answers. Event pages now prioritize timing, directions, updates, and the next CTA in a single mobile-first flow."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-sera-sand/60 bg-sera-ivory p-6 md:p-7">
            <h2 className="font-serif text-2xl text-sera-navy">The Grand Opening</h2>
            <p className="mt-2 text-sm text-sera-warm-grey">Saturday, July 12 · 7:00 PM · Brooklyn</p>

            <div className="mt-5 space-y-3">
              <EventRow icon={<Clock3 className="h-4 w-4" />} label="Schedule" value="Doors 7:00 · Live set 9:10 · Last call 12:30" />
              <EventRow icon={<MapPinned className="h-4 w-4" />} label="Directions" value="North lobby entry. Rideshare drop: 80 Wythe Ave." />
              <EventRow icon={<Info className="h-4 w-4" />} label="Guest info" value="Cocktail attire · ID required · Coat check available." />
            </div>

            <Button variant="sera" className="mt-6 w-full" asChild>
              <Link to="/rsvp/demo-token">Confirm attendance</Link>
            </Button>
          </article>

          <article className="rounded-3xl border border-sera-sand/50 bg-white/70 p-6 md:p-7">
            <p className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sera-warm-grey">
              <Megaphone className="h-3.5 w-3.5" /> Live updates
            </p>
            <div className="space-y-3">
              {updates.map((update) => (
                <div key={update} className="rounded-2xl border border-sera-sand/60 bg-sera-ivory px-4 py-3 text-sm text-sera-navy">
                  {update}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-sera-warm-grey">Pinned updates keep all guests in sync if timing or logistics change during the night.</p>
          </article>
        </div>
      </GuestFlowFrame>
      <Footer />
    </div>
  );
}

function EventRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sera-sand/60 p-3">
      <p className="mb-1 flex items-center gap-2 text-xs text-sera-warm-grey">
        {icon}
        {label}
      </p>
      <p className="text-sm text-sera-navy">{value}</p>
    </div>
  );
}
