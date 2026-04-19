import { CalendarClock, MapPin } from "lucide-react";
import { EventPageTheme } from "@/lib/event-page-theme";
import { cn } from "@/lib/utils";

type EventHeroProps = {
  theme: EventPageTheme;
  title: string;
  location: string;
  dateTimeLabel: string;
  hostLine: string;
};

export function EventHero({ theme, title, location, dateTimeLabel, hostLine }: EventHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/35 bg-white/10 px-6 py-16 backdrop-blur-[2px] md:px-12 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="sera-label text-[var(--event-text-secondary)]">Invitation</p>
        <h1 className={cn("mt-4 text-5xl leading-[0.96] md:text-7xl", theme.fontHeading)}>{title}</h1>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 text-sm text-[var(--event-text-secondary)] md:flex-row md:gap-6 md:text-base">
          <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{location}</p>
          <span className="hidden h-1 w-1 rounded-full bg-[var(--event-text-secondary)]/80 md:inline-block" />
          <p className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" />{dateTimeLabel}</p>
        </div>
        <p className="mt-5 text-sm italic text-[var(--event-text-secondary)] md:text-base">{hostLine}</p>
      </div>
    </section>
  );
}
