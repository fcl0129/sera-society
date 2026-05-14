import type { BuilderConfig, WidgetKey } from "@/lib/builder/types";
import { InvitationPreview } from "@/components/invitation-styles";
import { formatEventLine } from "@/components/invitation-styles/InvitationFrame";

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[hsl(var(--border))] py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-6 space-y-6">
        <p
          className="text-[0.65rem] uppercase tracking-[0.32em] text-[hsl(var(--sera-warm-grey))]"
        >
          {eyebrow}
        </p>
        {title && (
          <h3 className="font-serif text-3xl md:text-4xl text-[hsl(var(--sera-deep-navy))] leading-tight">
            {title}
          </h3>
        )}
        <div className="text-[hsl(var(--foreground))] sera-body">{children}</div>
      </div>
    </section>
  );
}

function HeroWidget({ config }: { config: BuilderConfig }) {
  const { basics, invitation } = config;
  return (
    <section className="relative bg-[hsl(var(--sera-deep-navy))] text-[hsl(var(--sera-ivory))] py-20 md:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="text-[0.65rem] uppercase tracking-[0.36em] opacity-70">
          {invitation.hostLine || "By invitation"}
        </p>
        <h1
          className="font-serif text-5xl md:text-7xl leading-[0.95]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {invitation.headline || basics.title || "An evening, by invitation"}
        </h1>
        <p className="italic opacity-85 max-w-xl mx-auto">{invitation.subheading}</p>
        <div className="mx-auto h-px w-12 bg-[hsl(var(--sera-warm-grey))]" />
        <p className="text-sm tracking-wide opacity-90">
          {formatEventLine(basics.date, basics.startTime, basics.location)}
        </p>
      </div>
    </section>
  );
}

function RsvpWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="RSVP" title="Will you join us?">
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input
          className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none placeholder:text-[hsl(var(--sera-warm-grey))]"
          placeholder="Your full name"
        />
        <input
          type="email"
          className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none placeholder:text-[hsl(var(--sera-warm-grey))]"
          placeholder="Email"
        />
        {config.rsvp.askDietary && (
          <input className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none" placeholder="Dietary notes" />
        )}
        {config.rsvp.askSong && (
          <input className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none" placeholder="A song you'd like to hear" />
        )}
        {config.rsvp.askArrival && (
          <input className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none" placeholder="Arrival time" />
        )}
        {config.rsvp.customQuestion && (
          <input className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none" placeholder={config.rsvp.customQuestion} />
        )}
        <button
          type="submit"
          className="mt-4 inline-flex items-center justify-center px-8 py-3 bg-[hsl(var(--sera-oxblood))] text-[hsl(var(--sera-ivory))] uppercase tracking-[0.2em] text-xs"
        >
          {config.invitation.rsvpCta || "Reply"}
        </button>
        {config.rsvp.deadline && (
          <p className="text-xs text-[hsl(var(--sera-warm-grey))] mt-2">
            Kindly reply by {config.rsvp.deadline}
          </p>
        )}
      </form>
    </Section>
  );
}

function ScheduleWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="The evening" title="Schedule">
      <ul className="divide-y divide-[hsl(var(--border))]">
        {config.widgets.schedule.map((s) => (
          <li key={s.id} className="py-4 flex gap-6">
            <span className="font-mono text-sm w-16 text-[hsl(var(--sera-oxblood))]">{s.time}</span>
            <div>
              <p className="font-serif text-lg">{s.title}</p>
              {s.detail && <p className="text-sm text-[hsl(var(--sera-warm-grey))]">{s.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function LocationWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="Location" title={config.basics.location || "To be shared"}>
      <div className="aspect-[16/9] bg-[hsl(var(--sera-surface-cool))] rounded border border-[hsl(var(--border))] mb-4 flex items-center justify-center text-[hsl(var(--sera-warm-grey))] text-sm">
        Map preview
      </div>
      {config.widgets.locationNotes && <p>{config.widgets.locationNotes}</p>}
    </Section>
  );
}

function DressCodeWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="Dress code" title={config.basics.dressCode || "As you wish"}>
      <p className="text-[hsl(var(--sera-warm-grey))] italic">Dress for the night you want.</p>
    </Section>
  );
}

function MenuWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="Menu" title="What we’ll share">
      <p className="whitespace-pre-line">{config.widgets.menu || "A short menu of the evening."}</p>
    </Section>
  );
}

function GuestNotesWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="From the host" title="A note">
      <p className="whitespace-pre-line italic">{config.widgets.guestNotes}</p>
    </Section>
  );
}

function PlaylistWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="Sound" title="Playlist">
      {config.widgets.playlistUrl ? (
        <a
          href={config.widgets.playlistUrl}
          target="_blank"
          rel="noreferrer"
          className="underline text-[hsl(var(--sera-oxblood))]"
        >
          {config.widgets.playlistUrl}
        </a>
      ) : (
        <p className="text-[hsl(var(--sera-warm-grey))]">A playlist will be added.</p>
      )}
    </Section>
  );
}

function GiftWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="Gift" title="">
      <p className="whitespace-pre-line">{config.widgets.gift || "Your presence is the gift."}</p>
    </Section>
  );
}

function AccommodationWidget({ config }: { config: BuilderConfig }) {
  return (
    <Section eyebrow="Stay" title="Accommodation">
      <p className="whitespace-pre-line">{config.widgets.accommodation}</p>
    </Section>
  );
}

function GalleryWidget({ config }: { config: BuilderConfig }) {
  const urls = config.widgets.moodboardUrls.filter(Boolean);
  return (
    <Section eyebrow="Mood" title="A glimpse">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(urls.length ? urls : [null, null, null, null, null, null]).map((u, i) =>
          u ? (
            <img key={i} src={u} alt="" className="aspect-square object-cover w-full rounded" />
          ) : (
            <div key={i} className="aspect-square bg-[hsl(var(--sera-surface-cool))] rounded" />
          ),
        )}
      </div>
    </Section>
  );
}

function DrinkTicketsWidget() {
  return (
    <Section eyebrow="Sera Pass" title="Drink tickets">
      <p className="text-[hsl(var(--sera-warm-grey))]">
        Each guest will receive a Sera Pass at this event. (Setup coming soon.)
      </p>
    </Section>
  );
}

function CheckInWidget() {
  return (
    <Section eyebrow="Arrival" title="Check-in">
      <p className="text-[hsl(var(--sera-warm-grey))]">
        Guests will check in on arrival. (Setup coming soon.)
      </p>
    </Section>
  );
}

export const WIDGET_RENDERERS: Record<
  WidgetKey,
  (p: { config: BuilderConfig }) => JSX.Element
> = {
  hero: HeroWidget,
  rsvp: RsvpWidget,
  schedule: ScheduleWidget,
  location: LocationWidget,
  dress_code: DressCodeWidget,
  menu: MenuWidget,
  guest_notes: GuestNotesWidget,
  playlist: PlaylistWidget,
  gift: GiftWidget,
  accommodation: AccommodationWidget,
  gallery: GalleryWidget,
  drink_tickets: DrinkTicketsWidget,
  checkin: CheckInWidget,
};