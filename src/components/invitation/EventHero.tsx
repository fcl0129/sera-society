import { CalendarClock, MapPin } from "lucide-react";
import { EventTheme } from "@/types/theme";
import { cn } from "@/lib/utils";

type EventHeroProps = {
  theme: EventTheme;
  title: string;
  location: string;
  dateTimeLabel: string;
  hostLine: string;
};

export function EventHero({ theme, title, location, dateTimeLabel, hostLine }: EventHeroProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border px-6 py-14 md:px-12 md:py-20"
      style={{
        background: "var(--event-surface)",
        borderColor: "var(--event-surface-border)",
      }}
    >
      <div className="relative mx-auto max-w-3xl text-center">
        <p className={cn("sera-label text-[var(--event-text-secondary)]", theme.typography.label)}>Invitation</p>
        <h1 className={cn("mt-4 text-5xl leading-[0.94] md:text-7xl", theme.typography.heading)}>{title}</h1>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 text-sm text-[var(--event-text-secondary)] md:flex-row md:gap-6 md:text-base">
          <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{location}</p>
          <span className="hidden h-1 w-1 rounded-full bg-[var(--event-text-secondary)]/70 md:inline-block" />
          <p className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" />{dateTimeLabel}</p>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-sm italic text-[var(--event-text-secondary)] md:text-base">{hostLine}</p>
      </div>
    </section>
  );
}
