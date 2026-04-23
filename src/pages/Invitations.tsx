import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, MapPin, Ticket } from "lucide-react";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";

const checklist = ["Who is invited", "Arrival window", "Venue and map", "RSVP timing", "Dress guidance", "Entry notes"];

export default function Invitations() {
  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader
          title="Invitation flows that guests instantly understand"
          description="Give guests what they need in one elegant view, with no noise and no missed details."
        />
      </SeraContainer>

      <SeraSection>
        <SeraContainer>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <article className="space-y-5 border-t border-[#e7d8c4]/20 pt-6 text-[#dfd2c1]">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl text-[#f2e8d9]">Sera Society Night</p>
                <span className="text-[0.62rem] uppercase tracking-[0.2em]">Invitation</span>
              </div>
              <p>You’re invited for Saturday, July 12. Doors open at 7:00 PM.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 border-t border-[#e7d8c4]/15 pt-3">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.13em]"><CalendarClock className="h-3.5 w-3.5" /> Arrival</p>
                  <p>7:00 PM — 8:30 PM</p>
                </div>
                <div className="space-y-1 border-t border-[#e7d8c4]/15 pt-3">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.13em]"><MapPin className="h-3.5 w-3.5" /> Venue</p>
                  <p>The Wythe Hotel, Brooklyn</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Button asChild className="sera-landing-btn sera-landing-btn--primary h-10 rounded-none px-5 py-0 text-[0.7rem]"><Link to="/rsvp/demo-token">Respond now</Link></Button>
                <Button asChild className="sera-landing-btn sera-landing-btn--secondary h-10 rounded-none px-5 py-0 text-[0.7rem]"><Link to="/event-pages?event=garden-editorial">View event page</Link></Button>
              </div>
            </article>

            <aside className="space-y-3 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#decebb]/72">Guest clarity checklist</p>
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item} className="inline-flex items-center gap-2 text-sm"><Ticket className="h-3.5 w-3.5" />{item}</li>
                ))}
              </ul>
              <Link to="/platform" className="inline-flex items-center gap-2 text-sm text-[#f0e4d3] hover:text-white">Explore the full journey <ArrowRight className="h-4 w-4" /></Link>
            </aside>
          </div>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
