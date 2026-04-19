import { Clock3, GlassWater, Ticket } from "lucide-react";
import { EventTheme } from "@/types/theme";
import { EventInfoSection } from "@/lib/event-page-examples";
import { cn } from "@/lib/utils";

const defaultSections: EventInfoSection[] = [
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
  theme: EventTheme;
  sections?: EventInfoSection[];
};

export function InfoGrid({ theme, sections = defaultSections }: InfoGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {sections.map((section) => {
        const Icon = section.icon;

        return (
          <article
            key={section.title}
            className="rounded-[1.75rem] border p-5"
            style={{
              background: "var(--event-surface)",
              borderColor: "var(--event-surface-border)",
            }}
          >
            <p className={cn("mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--event-text-secondary)]", theme.typography.label)}>
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
