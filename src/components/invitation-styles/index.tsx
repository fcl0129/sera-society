import type { BuilderConfig, InvitationStyleKey } from "@/lib/builder/types";
import { InvitationFrame, formatEventLine } from "./InvitationFrame";

interface StyleProps {
  config: BuilderConfig;
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p
      className="text-[0.62rem] uppercase tracking-[0.32em]"
      style={{ color, fontFamily: "var(--font-sans)" }}
    >
      {children}
    </p>
  );
}

function MidnightDinner({ config }: StyleProps) {
  const { invitation, basics } = config;
  return (
    <InvitationFrame
      bg="hsl(var(--sera-deep-navy))"
      fg="hsl(var(--sera-ivory))"
      accent="hsl(var(--sera-warm-grey))"
    >
      <Eyebrow color="hsl(var(--sera-stone))">{invitation.hostLine || "By invitation"}</Eyebrow>
      <div className="space-y-4 text-center">
        <h2
          className="leading-[0.95] text-[clamp(1.6rem,6vw,2.6rem)]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          {invitation.headline || basics.title || "An evening, by invitation"}
        </h2>
        <p
          className="italic text-[0.95rem] opacity-80"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {invitation.subheading}
        </p>
      </div>
      <div className="space-y-3 text-center">
        <div className="mx-auto h-px w-12" style={{ background: "hsl(var(--sera-warm-grey))" }} />
        <p className="text-[0.78rem] tracking-wide opacity-90">
          {formatEventLine(basics.date, basics.startTime, basics.location)}
        </p>
        {invitation.note && <p className="text-xs opacity-70 italic">{invitation.note}</p>}
      </div>
    </InvitationFrame>
  );
}

function OxbloodSalon({ config }: StyleProps) {
  const { invitation, basics } = config;
  return (
    <InvitationFrame
      bg="hsl(var(--sera-oxblood))"
      fg="hsl(var(--sera-ivory))"
      accent="hsl(var(--sera-rosewood))"
    >
      <div className="flex justify-between items-start">
        <Eyebrow color="hsl(var(--sera-ivory) / 0.7)">Salon</Eyebrow>
        <Eyebrow color="hsl(var(--sera-ivory) / 0.7)">No. 01</Eyebrow>
      </div>
      <div className="space-y-5">
        <h2
          className="text-[clamp(1.8rem,7vw,3rem)] leading-[0.92]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
        >
          {invitation.headline || basics.title || "An evening of consequence"}
        </h2>
        <p
          className="italic text-base opacity-90 max-w-[28ch]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {invitation.subheading}
        </p>
      </div>
      <div className="space-y-1 text-[0.78rem] tracking-wide opacity-90">
        <p>{formatEventLine(basics.date, basics.startTime, basics.location)}</p>
        <p className="opacity-60">{invitation.hostLine}</p>
      </div>
    </InvitationFrame>
  );
}

function GardenAfterDark({ config }: StyleProps) {
  const { invitation, basics } = config;
  return (
    <InvitationFrame
      bg="hsl(var(--sera-moss))"
      fg="hsl(var(--sera-ivory))"
      accent="hsl(var(--sera-matcha-mist))"
    >
      <Eyebrow color="hsl(var(--sera-matcha-mist))">{invitation.hostLine || "Garden after dark"}</Eyebrow>
      <div className="space-y-4">
        <h2
          className="text-[clamp(1.6rem,6.5vw,2.8rem)] leading-[0.96]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {invitation.headline || basics.title || "Under the trees, after dark"}
        </h2>
        <p className="text-sm opacity-85" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {invitation.subheading}
        </p>
      </div>
      <div className="text-[0.78rem] tracking-wide opacity-90">
        {formatEventLine(basics.date, basics.startTime, basics.location)}
      </div>
    </InvitationFrame>
  );
}

function ChampagneMinimal({ config }: StyleProps) {
  const { invitation, basics } = config;
  return (
    <InvitationFrame
      bg="hsl(var(--sera-ivory))"
      fg="hsl(var(--sera-ink-brown))"
      accent="hsl(var(--sera-warm-stone))"
    >
      <Eyebrow color="hsl(var(--sera-warm-grey))">{invitation.hostLine || "Invitation"}</Eyebrow>
      <div className="space-y-6 text-center">
        <h2
          className="text-[clamp(1.6rem,6vw,2.6rem)] leading-[0.98]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          {invitation.headline || basics.title || "Please join us"}
        </h2>
        <div className="mx-auto h-px w-10" style={{ background: "hsl(var(--sera-warm-grey))" }} />
        <p className="text-sm" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {invitation.subheading}
        </p>
      </div>
      <p className="text-center text-[0.74rem] tracking-[0.2em] uppercase opacity-70">
        {formatEventLine(basics.date, basics.startTime, basics.location)}
      </p>
    </InvitationFrame>
  );
}

function VelvetClub({ config }: StyleProps) {
  const { invitation, basics } = config;
  return (
    <InvitationFrame
      bg="hsl(var(--sera-charcoal))"
      fg="hsl(var(--sera-ivory))"
      accent="hsl(var(--sera-oxblood))"
    >
      <Eyebrow color="hsl(var(--sera-oxblood-soft))">Late · Members Only</Eyebrow>
      <div className="space-y-3">
        <h2
          className="text-[clamp(1.8rem,8vw,3.2rem)] leading-[0.9] uppercase"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          {invitation.headline || basics.title || "After Hours"}
        </h2>
        <p className="text-sm opacity-80 max-w-[28ch]" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {invitation.subheading}
        </p>
      </div>
      <div className="flex items-end justify-between text-[0.74rem] tracking-wide opacity-80">
        <span>{formatEventLine(basics.date, basics.startTime, basics.location)}</span>
        <span style={{ color: "hsl(var(--sera-oxblood-soft))" }}>{invitation.hostLine}</span>
      </div>
    </InvitationFrame>
  );
}

const REGISTRY: Record<InvitationStyleKey, (p: StyleProps) => JSX.Element> = {
  midnight_dinner: MidnightDinner,
  oxblood_salon: OxbloodSalon,
  garden_after_dark: GardenAfterDark,
  champagne_minimal: ChampagneMinimal,
  velvet_club: VelvetClub,
};

export function InvitationPreview({ config }: { config: BuilderConfig }) {
  const Comp = REGISTRY[config.invitation.style] || MidnightDinner;
  return <Comp config={config} />;
}