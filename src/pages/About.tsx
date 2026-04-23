import { Link } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader
          title="A platform for thoughtful hosts"
          description="Sera Society brings creative direction and event operations into one quiet, confident system."
        />
      </SeraContainer>

      <SeraSection>
        <SeraContainer className="space-y-12">
          <div className="space-y-4 border-t border-[#e6d7c3]/20 pt-6">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#decfbe]/70">What we believe</p>
            <h2 className="font-display text-[2rem] leading-[0.95] text-[#f1e6d7]">Hosting should feel composed, not chaotic.</h2>
            <p className="max-w-3xl text-[#d5c9b8]">Sera is built for teams who care about guest experience as much as logistics. Invitations, RSVPs, check-in, and service tools all stay aligned under one brand voice.</p>
          </div>

          <div className="space-y-4 border-t border-[#e6d7c3]/20 pt-6">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#decfbe]/70">Who it serves</p>
            <h2 className="font-display text-[2rem] leading-[0.95] text-[#f1e6d7]">For organizers who notice every detail.</h2>
            <p className="max-w-3xl text-[#d5c9b8]">From intimate dinners to major cultural nights, Sera scales with your guest count while preserving an intentional tone throughout the journey.</p>
          </div>

          <div className="space-y-4 border-t border-[#e6d7c3]/20 pt-6">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#decfbe]/70">What you can run</p>
            <ul className="grid gap-2 text-[#d5c9b8] md:grid-cols-2">
              {[
                "Invitations and flyers",
                "Guest pages and RSVP",
                "Door check-in",
                "Digital drink tickets",
                "Live redemption flow",
                "Team roles and access",
              ].map((item) => (
                <li key={item} className="border-t border-[#e6d7c3]/15 py-2">{item}</li>
              ))}
            </ul>
          </div>

          <Button asChild className="sera-landing-btn sera-landing-btn--primary h-11 rounded-none px-6 py-0 text-[0.72rem]">
            <Link to="/request-access">Request access</Link>
          </Button>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
