import { Link, useSearchParams } from "react-router-dom";
import { EventPageHeader } from "@/components/invitation/EventPageHeader";
import { EventHero } from "@/components/invitation/EventHero";
import { RSVPCard } from "@/components/invitation/RSVPCard";
import { InfoGrid } from "@/components/invitation/InfoGrid";
import { ThemeWrapper } from "@/components/themes/ThemeWrapper";
import { eventPageExamples, eventPageExampleByKey } from "@/lib/event-page-examples";
import { resolveEventTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

export default function EventPages() {
  const [searchParams] = useSearchParams();

  const eventKey = searchParams.get("event")?.trim() || eventPageExamples[0].key;
  const eventExample = eventPageExampleByKey[eventKey] ?? eventPageExamples[0];
  const theme = resolveEventTheme(eventExample.themeId);

  return (
    <ThemeWrapper theme={theme}>
      <EventPageHeader />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-14 md:space-y-10 md:px-10 md:pb-20">
        <section className="flex flex-wrap gap-2" aria-label="Invitation theme selection">
          {eventPageExamples.map((example) => (
            <Link
              key={example.key}
              to={`/event-pages?event=${example.key}`}
              className={cn(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition",
                example.key === eventExample.key
                  ? "border-[var(--event-accent)] bg-[var(--event-accent)]/15 text-[var(--event-text-primary)]"
                  : "border-[var(--event-surface-border)] bg-[var(--event-surface)] text-[var(--event-text-secondary)] hover:text-[var(--event-text-primary)]"
              )}
            >
              {example.name}
            </Link>
          ))}
        </section>

        <EventHero
          theme={theme}
          title={eventExample.title}
          location={eventExample.location}
          dateTimeLabel={eventExample.dateTimeLabel}
          hostLine={eventExample.hostLine}
        />

        <div className="grid items-start gap-5 md:grid-cols-[1.2fr_.8fr]" id="details">
          <section
            className="rounded-[2rem] border p-6 md:p-8"
            id="schedule"
            style={{
              background: "var(--event-surface)",
              borderColor: "var(--event-surface-border)",
            }}
          >
            <p className="sera-label text-[var(--event-text-secondary)]">About the evening</p>
            <h2 className={cn("mt-3 text-3xl md:text-4xl", theme.typography.heading)}>A curated invitation experience</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--event-text-secondary)] md:text-base">{eventExample.about}</p>
          </section>

          <div id="rsvp">
            <RSVPCard theme={theme} />
          </div>
        </div>

        <InfoGrid theme={theme} sections={eventExample.sections} />
      </main>
    </ThemeWrapper>
  );
}
