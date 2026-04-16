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
      lead: "For dinners, birthdays, and small nights — clean, calm, and frictionless.",
      detail:
        "Event setup with a refined basic event page (title, date, location, message) and a cover image. Invitations via a shareable link, plus a simple auto‑generated invite email. RSVP (yes / no / maybe) with guest name, plus‑one support, and optional dietary notes. A host view that keeps the guest list readable with RSVP status at a glance. Light automation: one reminder before the RSVP deadline, a countdown timer, and Add to Calendar (Apple + Google). Not included in Essential: NFC, check‑in, chat, and advanced branding — intentionally kept clean.",
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
      lead: "Everything in Essential — plus the operational layer for the night itself.",
      detail:
        "Tickets & check‑in with QR scanning (camera) and NFC tap, including live status (checked‑in / not). Digital drink tickets with configurable drinks per guest and simple redemption: one tap = one drink, with a live remaining count per guest. Live guest management: a real‑time list showing who has arrived and who still has drinks left. Guest communication: a “Message host” action (MVP opens SMS/email), with an optional lightweight in‑app chat later. Light notifications: a reminder before the event and an “event starts soon” nudge. Not included in Social: white‑label, staff tooling, multi‑admin, and seating.",
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
      lead: "For companies and organized productions — run it like a system, not a spreadsheet.",
      detail:
        "Everything in Social, plus branding and staff execution. Branding: remove Sera branding, upload a logo, and set custom colors (custom domain can follow later). Staff tools: a dedicated staff view (separate login or secure link) and a check‑in dashboard showing arrivals live, drink usage, and support for multiple check‑in devices. Test mode: simulate the flow with fake check‑ins and fake ticket redemptions before the night. Staff prep system: an auto‑generated email with event info, check‑in instructions, and a test link to validate the flow. Advanced RSVP automation: reminders X days before deadline and an RSVP cutoff that disables responses and shows “contact host”. Export/control: guest list export (CSV), attendance export, and ticket usage export. Not included in Host: seating, timeline planning, and post‑event analytics.",
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
      lead: "For weddings, conferences, and once‑in‑a‑lifetime nights — orchestrated end‑to‑end.",
      detail:
        "Everything in Host, plus seating, collaboration, planning, and the story after. Seating system: table setup, guest assignments, and a visual table overview. Multi‑host collaboration: multiple admins with roles (Host / Staff / Viewer). Planning tools that stay light: a timeline for send invites, finalize guest list, and event day, plus a focused checklist. Post‑event “Evening Wrapped”: total guests, attendance rate, drinks consumed, and peak arrival time — with shareable visuals. Post‑event communication: a thank‑you message and an optional photo/recap share.",
    },
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function TierCard({ tier }: { tier: Tier }) {
  const isHighlight = tier.tone === "highlight";
  const isDim = tier.tone === "dim";
  const isEssential = tier.title === "SERA ESSENTIAL";

  return (
    <div
      className={cx(
        "group relative rounded-2xl border p-7 md:p-8",
        // More “Sera” glass, less “white card”
        "bg-black/20 border-white/10 backdrop-blur-md",
        "shadow-[0_14px_50px_rgba(0,0,0,0.35)]",
        "transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_18px_70px_rgba(0,0,0,0.55)]",
        isDim && "opacity-70 hover:opacity-85",
        isHighlight && "border-white/25"
      )}
    >
      {/* subtle ring/glow for SOCIAL only */}
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

            <h3
              className={cx(
                "sera-subheading text-2xl md:text-[28px] leading-tight tracking-wide",
                // keep Essential slightly calmer
                isEssential ? "text-sera-ivory/90" : "text-sera-ivory"
              )}
            >
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

        {/* CTA first (single primary action) */}
        <div className="mt-8 md:mt-9">
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

          {/* subtle editorial divider */}
          <div className="mt-6 h-px w-12 bg-white/10" />

          {/* Read more as editorial inline expansion (no heavy box) */}
          <details className="group/details mt-4">
            <summary
              className={cx(
                "cursor-pointer list-none select-none",
                "sera-body text-sera-sand text-sm",
                "inline-flex items-center gap-2",
                "opacity-70 hover:opacity-100 transition"
              )}
            >
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
              <p className="sera-body text-sera-ivory text-sm leading-relaxed">
                {tier.includes.lead}
              </p>
              <p className="sera-body text-sera-sand text-sm leading-relaxed mt-3">
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
            All tiers include: Event (name, date, location), guest list, RSVP (yes/no/maybe),
            and a shareable event page.
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
