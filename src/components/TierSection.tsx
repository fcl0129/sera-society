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
    lead: string;      // 1 sentence
    detail: string;    // 1–2 sentences (editorial, not a bullet list)
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
      lead:
        "Create and publish an event with core details, capacity, and a clean guest experience.",
      detail:
        "Guest list + RSVP with plus‑ones, a shareable guest page, and the foundation you need to run a night without friction — minimal setup, maximum clarity.",
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
      lead:
        "Everything in Essential, plus the operational layer for arrival, access, and redemption.",
      detail:
        "Digital drink tickets built for real‑time use, QR‑based check‑in and validation, and mobile‑first staff views that stay fast when the room is full.",
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
      lead:
        "A team‑ready setup for organizers and staff roles — built for coordinated operations.",
      detail:
        "Role‑based access for door and bar workflows, stronger guest segmentation by tier, and controls designed for multi‑person execution rather than solo hosting.",
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
      lead:
        "A bespoke tier for singular nights — the highest touch, the highest standard.",
      detail:
        "Custom presentation and guest experience tailored to the occasion, elevated operational setup, and a guided rollout shaped around the venue, the flow, and the details that matter.",
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
        "group relative rounded-2xl border",
        "p-7 md:p-8",
        // Keep surfaces consistent with the rest of your page
        // (subtle glass, no new full-bleed background)
        "bg-white/[0.035] border-white/10",
        "shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        "transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_22px_80px_rgba(0,0,0,0.45)]",
        isDim && "opacity-70 hover:opacity-85",
        isHighlight && "border-white/25"
      )}
    >
      {/* Subtle highlight ring/glow (keeps background unchanged) */}
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

            {/* Titles: editorial/serif feel — if your global typography already handles this,
                it will blend automatically. If not, add `font-serif` here. */}
            <h3 className="sera-subheading text-sera-ivory text-2xl md:text-[28px] leading-tight tracking-wide">
              {tier.title}
            </h3>
          </div>

          {tier.badge ? (
            <div className="shrink-0">
              <span
                className={cx(
