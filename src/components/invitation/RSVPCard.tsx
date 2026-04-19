import { EventPageTheme } from "@/lib/event-page-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RSVPCardProps = {
  theme: EventPageTheme;
};

export function RSVPCard({ theme }: RSVPCardProps) {
  return (
    <section className={cn("rounded-[2rem] border px-5 py-6 shadow-[0_28px_80px_-48px_rgba(18,9,5,0.8)] backdrop-blur-md md:px-8 md:py-8", theme.cardStyle)}>
      <p className="sera-label text-[var(--event-text-secondary)]">RSVP</p>
      <h2 className={cn("mt-3 text-3xl md:text-4xl", theme.fontHeading)}>Kindly reply</h2>
      <form className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)]">Full name</span>
          <Input placeholder="Your name" className="border-white/35 bg-white/30 placeholder:text-[var(--event-text-secondary)]/80" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)]">Guests</span>
          <select className="flex h-11 w-full rounded-md border border-white/35 bg-white/30 px-3 text-sm text-[var(--event-text-primary)] outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-[var(--event-accent)]">
            <option>Just me</option>
            <option>+1 guest</option>
            <option>+2 guests</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)]">Notes</span>
          <Textarea placeholder="Dietary requests, accessibility, or a short note." className="min-h-[110px] border-white/35 bg-white/30 placeholder:text-[var(--event-text-secondary)]/80" />
        </label>

        <Button type="submit" className="h-11 w-full text-sm" style={{ backgroundColor: "var(--event-accent)", color: "var(--event-background)" }}>
          RSVP
        </Button>
      </form>
    </section>
  );
}
