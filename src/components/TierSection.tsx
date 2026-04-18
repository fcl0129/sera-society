import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type TierTone = "default" | "highlight" | "dim";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tier = {
  title: string;
  label: string;
  badge?: string;
  copyHeadline: string;
  copySub: string;
  cta: string;
  href: string;
  tone: TierTone;
  bullets: string[];
  notIncluded?: string[];
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
    bullets: [
      "Create event + refined basic event page (title, date, location, message)",
      "Cover image",
      "Shareable link + simple invite email (auto-generated)",
      "RSVP: yes / no / maybe + plus-one",
      "Dietary notes (optional)",
      "Guest list (host view) with RSVP status",
      "1 reminder before RSVP deadline",
      "Countdown timer + Add to calendar (Apple + Google)",
    ],
    notIncluded: ["NFC", "Check-in", "Chat", "Advanced branding"],
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
    bullets: [
      "Everything in Essential",
      "QR check-in (camera scan)",
      "Nfc check-in (tap)",
      "Check-in status: checked-in / not",
      "Drink tickets: X drinks per guest (configurable)",
      "Redemption: 1 tap = 1 drink + live remaining count",
      "Real-time guest list (arrived + drinks left)",
      "Message host (MVP opens SMS/email) + optional simple chat later",
      "Light notifications: reminder + “event starts soon”",
    ],
    notIncluded: ["White-label", "Staff tools", "Multi-admin", "Seating"],
  },
  {
    title: "SERA HOST",
    label: "Early access",
    copyHeadline: "Run events with precision",
    copySub: "Built for teams, not just hosts",
    cta: "Request access",
    href: "/request-access",
    tone: "dim",
    bullets: [
      "Everything in Social",
      "Branding: remove Sera branding + logo + custom colors",
      "Staff view (separate login or secure link)",
      "Check-in dashboard: arrivals live + drink usage",
      "Multiple check-in devices",
      "Test mode: simulate check-ins + ticket redemption",
      "Staff prep email: event info + instructions + test link",
      "Advanced RSVP automation: reminders X days before deadline",
      "RSVP cutoff: closes responses + shows “contact host”",
      "Exports: guest list CSV + attendance + ticket usage",
    ],
    notIncluded: ["Seating", "Timeline planning", "Post-event analytics"],
  },
  {
    title: "SERA OCCASIONS",
    label: "By request",
    copyHeadline: "For moments that deserve perfection",
    copySub: "Designed for events you’ll never repeat",
    cta: "Request access",
    href: "/request-access",
    tone: "dim",
    bullets: [
      "Everything in Host",
      "Seating system: tables + assignments + visual overview",
      "Multi-host collaboration: Host / Staff / Viewer roles",
      "Planning tools: timeline + focused checklist",
      "Evening Wrapped: totals, attendance, drinks, peak arrival time + sharable visuals",
      "Post-event communication: thank you + photos/recap",
    ],
  },
];

function TierCard({ tier }: { tier: Tier }) {
  const isHighlight = tier.tone === "highlight";
  const isDim = tier.tone === "dim";

  return (
    <div
      className={cx(
        "group relative rounded-2xl p-8 md:p-9",
        "bg-white/45 backdrop-blur-md",
        "border transition-all duration-300 ease-out",
        isHighlight
          ? "border-sera-oxblood/40 shadow-[0_20px_60px_-30px_hsl(var(--sera-navy)/0.35)]"
          : "border-white/40",
        "hover:border-sera-navy/30 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-32px_hsl(var(--sera-navy)/0.30)]",
        isDim && "opacity-85 hover:opacity-100"
      )}
    >
      {/* Subtle hairline accent on highlight tier */}
      {isHighlight && (
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-sera-oxblood/60 to-transparent"
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="sera-label text-sera-oxblood mb-3">{tier.label}</p>
            <h3 className="sera-subheading text-sera-navy text-2xl md:text-[28px] leading-tight tracking-wide">
              {tier.title}
            </h3>
          </div>

          {tier.badge ? (
            <span className="shrink-0 inline-flex items-center px-3 py-1 text-[10px] tracking-[0.14em] uppercase border border-sera-navy/20 bg-sera-navy text-sera-ivory">
              {tier.badge}
            </span>
          ) : null}
        </div>

        <div className="space-y-2 mb-8">
          <p className="font-serif italic text-sera-navy text-lg md:text-xl leading-snug">
            {tier.copyHeadline}
          </p>
          <p className="sera-body text-sera-warm-grey text-sm leading-relaxed">
            {tier.copySub}
          </p>
        </div>

        <div className="h-px w-10 bg-sera-navy/15 mb-6" />

        <Button variant="sera" size="lg" asChild>
          <Link to={tier.href}>{tier.cta}</Link>
        </Button>

        <details className="group/details mt-6">
          <summary className="cursor-pointer list-none select-none inline-flex items-center gap-2 sera-body text-sera-navy/70 hover:text-sera-navy transition text-sm">
            <span className="underline underline-offset-4 decoration-sera-navy/20 group-hover/details:decoration-sera-navy/50">
              Read more
            </span>
            <span
              aria-hidden="true"
              className="inline-block transition-transform group-open/details:rotate-180"
            >
              ▾
            </span>
          </summary>

          <div className="mt-5 max-w-prose">
            <ul className="space-y-2.5">
              {tier.bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[8px] h-1 w-1 rounded-full bg-sera-oxblood/70 shrink-0" />
                  <p className="sera-body text-sera-warm-grey text-sm leading-relaxed">
                    {item}
                  </p>
                </li>
              ))}
            </ul>

            {tier.notIncluded?.length ? (
              <div className="mt-6">
                <p className="sera-label text-sera-stone mb-3">Not included</p>
                <div className="flex flex-wrap gap-2">
                  {tier.notIncluded.map((x) => (
                    <span
                      key={x}
                      className="text-[11px] px-2.5 py-1 border border-sera-sand/80 bg-sera-beige/40 text-sera-warm-grey"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </div>
  );
}

export default function TierSection() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <p className="sera-label text-sera-oxblood mb-4">Plans</p>
          <h2 className="sera-heading text-sera-navy text-3xl md:text-5xl">
            Choose the plan that matches your event operation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {TIERS.map((tier) => (
            <TierCard key={tier.title} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}
