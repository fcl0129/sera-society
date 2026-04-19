import { Clock3, GlassWater, Ticket } from "lucide-react";
import { EventPageTheme } from "@/lib/event-page-theme";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Event details",
    icon: Ticket,
    lines: ["Cocktail attire requested", "Check-in opens at 7:00 PM", "Private entrance at the north lobby"],
  },
  {
    title: "Schedule",
    icon: Clock3,
    lines: ["7:30 PM · Guest arrival", "8:15 PM · Host toast", "10:00 PM · Live performance"],
  },
  {
    title: "Tickets & passes",
    icon: GlassWater,
    lines: ["Digital ticket required at entry", "Two signature drink passes included", "Additional bar menu available onsite"],
  },
];

type InfoGridProps = {
  theme: EventPageTheme;
};

export function InfoGrid({ theme }: InfoGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {sections.map((section) => {
        const Icon = section.icon;

        return (
          <article key={section.title} className={cn("rounded-[1.75rem] border p-5 backdrop-blur-sm", theme.cardStyle)}>
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--event-text-secondary)]">
              <Icon className="h-4 w-4" />
              {section.title}
            </p>
            <ul className="space-y-2 text-sm text-[var(--event-text-primary)]">
              {section.lines.map((line) => (
                <li key={line} className="leading-relaxed">{line}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
