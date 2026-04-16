import { Link } from "react-router-dom";

type TierTone = "default" | "highlight" | "dim";

type Tier = {
  title: string;
  label: string;
  badge?: string;
  copyHeadline: string;
  copySub: string;
  cta: string;
  href: string;
  tone: TierTone;
  includes: {
    lead: string;
    detail: string;
  };
};

const TIERS: Tier[] = [
  {
    title: "SERA ESSENTIAL",
    label: "Available now",
    copyHeadline: "Effortless hosting",
    copySub: "Everything you need — nothing you don’t",
    cta: "Request access",
    href: "/request-access",
    tone: "default",
    includes: {
      lead: "Core hosting, beautifully simplified.",
      detail:
        "Event setup, guest list, RSVP (yes/no/maybe), and a shareable event page — clean, calm, and frictionless.",
    },
  },
  {
    title: "SERA SOCIAL",
    label: "Available now",
    badge: "Most requested",
    copyHeadline: "Where the event comes alive",
    copySub: "From arrival to last drink",
    cta: "Request access",
    href: "/request-access",
    tone: "highlight",
    includes: {
      lead: "Everything in Essential — plus the night’s operational layer.",
      detail:
        "Designed for flow: arrival, access, and redemption — built mobile‑first for the room, not the desk.",
    },
  },
  {
    title: "SERA HOST",
    label: "Early access",
    copyHeadline: "Run events with precision",
    copySub: "Built for teams, not just hosts",
    cta: "Request access",
    href: "/request-access",
    tone: "dim",
    includes: {
      lead: "Team execution and tighter control.",
      detail:
        "A more structured operational setup for multiple people running one night — with higher precision and oversight.",
    },
  },
  {
    title: "SERA OCCASIONS",
    label: "By request",
    copyHeadline: "For moments that deserve perfection",
    copySub: "Designed for events you’ll never repeat",
    cta: "Request access",
    href: "/request-access",
    tone: "dim",
    includes: {
      lead: "Orchestrated, bespoke experiences.",
      detail:
        "Designed around singular moments — elevated presentation, collaboration, and post‑event wrap‑up for the full story.",
    },
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function TierCard({ tier }: { tier: Tier }) {
  const isHighlight = tier.tone === "highlight";
  const isDim = tier.tone === "dim";

  return (
    <div
      className={cx(
        "group relative rounded-2xl border p-7 md:p-8",
        "bg-white/[0.035] border-white/10",
        "shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        "transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_22px_80px_rgba(0,0,0,0.45)]",
        isDim && "opacity-70 hover:opacity-85",
        isHighlight && "border-white/25"
      )}
    >
      {isHighlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-90"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.14), 0 0 70px rgba(120,140,255,0.16)",
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="sera-label text-sera-stone mb-2">{tier.label}</p>
            <h3 className="sera-subheading text-sera-ivory text-2xl md:text-[28px] leading-tight tracking-wide">
              {tier.title}
            </h3>
          </div>

          {tier.badge ? (
            <div className="shrink-0">
              <span
                className={cx(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs",
                  "border border-white/15 bg-white/5 text-sera-ivory",
                  "shadow-[0_12px_40px_rgba(0,0,0,0.28)]",
                  isHighlight && "border-white/25 bg-white/10"
                )}
              >
                {tier.badge}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 md:mt-7 space-y-2">
          <p className="sera-body text-sera-ivory text-lg md:text-[18px] leading-snug">
            {tier.copyHeadline}
          </p>
          <p className="sera-body text-sera-sand text-sm md:text-[14px] leading-relaxed">
            {tier.copySub}
          </p>
        </div>

        <div className="mt-8 md:mt-9 flex items-start justify-between gap-4">
          <Link
            to={tier.href}
            className={cx(
              "inline-flex items-center justify-center",
              "rounded-full px-5 py-2.5 text-sm",
              "transition duration-300 ease-out",
              "border",
              isHighlight
                ? "bg-white text-black border-white/20 hover:bg-white/90"
                : "bg-transparent text-sera-ivory border-white/15 hover:border-white/30 hover:bg-white/5"
            )}
          >
            {tier.cta}
          </Link>

          <details className="group/details">
            <summary
              className={cx(
                "cursor-pointer list-none select-none",
                "sera-body text-sera-sand text-sm",
                "inline-flex items-center gap-2",
                "rounded-full px-3 py-2",
                "border border-transparent hover:border-white/10 hover:bg-white/5 transition"
              )}
            >
              <span className="underline underline-offset-4 decoration-white/20 group-hover/details:decoration-white/30">
                Read more
              </span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-open/details:rotate-180"
              >
                ▾
              </span>
            </summary>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4 md:p-5">
              <p className="sera-body text-sera-ivory text-sm leading-relaxed">
                {tier.includes.lead}
              </p>
              <p className="sera-body text-sera-sand text-sm leading-relaxed mt-2">
                {tier.includes.detail}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function TierSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="sera-label text-sera-stone mb-3">
            Choose your level of hosting
          </p>
          <h2 className="sera-subheading text-sera-ivory text-3xl md:text-4xl leading-tight">
            Premium tiers — built for the night.
          </h2>
          <p className="sera-body text-sera-sand mt-4 text-sm md:text-base leading-relaxed">
            All tiers include: Event setup, guest list, RSVP (yes/no/maybe), and a
            shareable event page.
          </p>
        </div>

        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {TIERS.map((tier) => (
            <TierCard key={tier.title} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}
