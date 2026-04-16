import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
        "bg-black/20 border-white/10 backdrop-blur-md",
        "shadow-[0_14px_50px_rgba(0,0,0,0.35)]",
        "transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_18px_70px_rgba(0,0,0,0.55)]",
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
            <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs border border-white/15 bg-white/5 text-sera-ivory shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
              {tier.badge}
            </span>
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

        <div className="mt-8 md:mt-9">
          {/* Button should match "Log in" if that uses shadcn Button */}
          <Button asChild className="rounded-full">
            <Link to={tier.href}>{tier.cta}</Link>
          </Button>

          <div className="mt-6 h-px w-12 bg-white/10" />

          <details className="group/details mt-4">
            <summary className="cursor-pointer list-none select-none inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition sera-body text-sera-sand text-sm">
              <span className="underline underline-offset-4 decoration-white/20 group-hover/details:decoration-white/40">
                Read more
              </span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform group-open/details:rotate-180"
              >
                ▾
              </span>
            </summary>

            <div className="mt-4 max-w-prose">
              <ul className="space-y-2">
                {tier.bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/25 shrink-0" />
                    <p className="sera-body text-sera-sand text-sm leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>

              {tier.notIncluded?.length ? (
                <div className="mt-5">
                  <p className="sera-body text-sera-stone text-xs tracking-wide uppercase mb-2">
                    Not included
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tier.notIncluded.map((x) => (
                      <span
                        key={x}
                        className="text-xs rounded-full px-3 py-1 border border-white/10 bg-white/5 text-sera-sand"
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
    </div>
  );
}

export default function TierSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="sera-label text-sera-stone mb-3">Choose your level of hosting</p>
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
