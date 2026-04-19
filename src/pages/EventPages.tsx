import { Link, useSearchParams } from "react-router-dom";
import { ThemeWrapper } from "@/components/invitation/ThemeWrapper";
import { EventHero } from "@/components/invitation/EventHero";
import { RSVPCard } from "@/components/invitation/RSVPCard";
import { InfoGrid } from "@/components/invitation/InfoGrid";
import { eventPageExamples, eventPageExampleByKey } from "@/lib/event-page-examples";
import { resolveEventPageTheme } from "@/lib/event-page-theme";
import { cn } from "@/lib/utils";

export default function EventPages() {
  const [searchParams] = useSearchParams();

  const eventKey = searchParams.get("event")?.trim() || eventPageExamples[0].key;
  const eventExample = eventPageExampleByKey[eventKey] ?? eventPageExamples[0];

  const theme = resolveEventPageTheme({
    themeKey: eventExample.themeKey,
  });

  return (
    <ThemeWrapper theme={theme}>
      <header className="px-6 py-6 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--event-text-secondary)]">
          <nav className="hidden items-center gap-5 md:flex">
            <a href="#details" className="transition hover:text-[var(--event-text-primary)]">Details</a>
            <a href="#rsvp" className="transition hover:text-[var(--event-text-primary)]">RSVP</a>
            <a href="#schedule" className="transition hover:text-[var(--event-text-primary)]">Schedule</a>
          </nav>
          <p className="mx-auto font-serif text-2xl normal-case tracking-tight text-[var(--event-text-primary)]">Sera</p>
          <Link to="/invitations" className="hidden transition hover:text-[var(--event-text-primary)] md:block">Gallery</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-12 md:space-y-10 md:px-10 md:pb-16">
        <section className="rounded-2xl border border-[var(--event-accent)]/30 bg-[var(--event-background)]/35 p-3 backdrop-blur-sm">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--event-text-secondary)]">Theme demos</p>
          <div className="flex flex-wrap gap-2">
            {eventPageExamples.map((example) => (
              <Link
                key={example.key}
                to={`/event-pages?event=${example.key}`}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition",
                  example.key === eventExample.key
                    ? "border-[var(--event-accent)] bg-[var(--event-accent)]/15 text-[var(--event-text-primary)]"
                    : "border-[var(--event-accent)]/35 text-[var(--event-text-secondary)] hover:text-[var(--event-text-primary)]"
                )}
              >
                {example.name}
              </Link>
            ))}
          </div>
        </section>

        <EventHero
          theme={theme}
          title={eventExample.title}
          location={eventExample.location}
          dateTimeLabel={eventExample.dateTimeLabel}
          hostLine={eventExample.hostLine}
        />

        <div className="grid items-start gap-5 md:grid-cols-[1.25fr_.75fr]" id="details">
          <section className="rounded-[2rem] border border-white/35 bg-white/12 p-6 backdrop-blur-sm md:p-8" id="schedule">
            <p className="sera-label text-[var(--event-text-secondary)]">About the evening</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">A curated invitation experience</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--event-text-secondary)] md:text-base">
              {eventExample.about}
            </p>
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
