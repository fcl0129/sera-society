import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestFlowFrame from "@/components/guest/GuestFlowFrame";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, MapPin, Ticket } from "lucide-react";

const checklist = [
  "Who this invite is for",
  "Date + arrival window",
  "Venue + one-tap map",
  "RSVP deadline",
  "Dress guidance",
  "Ticket + entry notes",
];

export default function Invitations() {
  return (
    <div className="min-h-screen bg-sera-surface-light">
      <Navbar />
      <GuestFlowFrame
        eyebrow="Guest Invitations"
        title={
          <>
            Every guest sees
            <br />
            <span className="italic text-sera-oxblood">exactly what matters</span>
          </>
        }
        description="A clean invite built for real-world events: fast to read on mobile, easy to act on, impossible to miss the next step."
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-3xl border border-sera-sand/60 bg-sera-ivory p-5 shadow-sm md:p-7">
            <div className="flex items-center justify-between border-b border-sera-sand/60 pb-4">
              <p className="font-serif text-xl text-sera-navy">Sera Society Night</p>
              <span className="rounded-full bg-sera-navy px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-sera-ivory">Invite</span>
            </div>

            <div className="space-y-4 py-5 text-sm text-sera-navy">
              <p className="rounded-2xl bg-sera-surface-light p-3">You're on the list for Saturday, July 12 · Doors at 7:00 PM.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-sera-sand/60 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs text-sera-warm-grey"><CalendarClock className="h-3.5 w-3.5" />Arrival window</p>
                  <p>7:00 PM — 8:30 PM</p>
                </div>
                <div className="rounded-2xl border border-sera-sand/60 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs text-sera-warm-grey"><MapPin className="h-3.5 w-3.5" />Venue</p>
                  <p>The Wythe Hotel, Brooklyn</p>
                </div>
              </div>
              <p className="rounded-2xl border border-sera-sand/60 p-3 text-sera-warm-grey">Dress code: Cocktail · Please RSVP by July 8.</p>
            </div>

            <div className="flex flex-col gap-3 border-t border-sera-sand/60 pt-4 sm:flex-row">
              <Button variant="sera" asChild className="sm:flex-1">
                <Link to="/rsvp/demo-token">RSVP now</Link>
              </Button>
              <Button variant="sera-outline" asChild className="sm:flex-1">
                <Link to="/event-pages?event=light-garden">View event page</Link>
              </Button>
            </div>
          </article>

          <aside className="space-y-4 rounded-3xl border border-sera-sand/50 bg-white/60 p-5 md:p-6">
            <p className="sera-label text-sera-warm-grey">Fast comprehension checklist</p>
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-sera-navy">
                  <Ticket className="h-3.5 w-3.5 text-sera-oxblood" />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="link" asChild className="h-auto p-0 text-sera-navy">
              <Link to="/platform" className="inline-flex items-center gap-2">
                Explore guest flow architecture
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </aside>
        </div>
      </GuestFlowFrame>
      <Footer />
    </div>
  );
}
