import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, ClipboardList, Globe, Palette, ScanLine, Search, ShieldCheck, Smartphone, Ticket, Users } from "lucide-react";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";

const features = [
  { icon: CalendarDays, title: "Plan the evening", desc: "Shape your timeline, venue details, and pacing in one calm workspace." },
  { icon: Palette, title: "Design your invitation", desc: "Create invitations and flyers with an editorial look that feels true to your event." },
  { icon: Users, title: "Keep track of your guests", desc: "See responses, plus-ones, and arrivals without losing the human side of hosting." },
  { icon: Globe, title: "Share one event page", desc: "Offer guests a polished home for schedule, location, and everything they need." },
  { icon: Ticket, title: "Offer digital drink tickets", desc: "Deliver tickets directly to guests and keep service moving naturally." },
  { icon: ShieldCheck, title: "Welcome guests with confidence", desc: "Support your door team with fast check-in and clear status at a glance." },
  { icon: ScanLine, title: "Run Scan Pass", desc: "Let staff confirm drink tickets in seconds with the same tracking logic used across Sera." },
  { icon: Smartphone, title: "Run smoothly on mobile", desc: "Every step is designed for real event conditions, right from your phone." },
];

const redemptionOptions = [
  {
    icon: ScanLine,
    name: "Scan Pass",
    status: "Available now",
    description: "Guests show their pass. Staff scan. Sera checks the ticket instantly and records the redemption.",
    tags: ["No app required", "Works on all phones", "Real-time ticket tracking", "Same logic as TapStation"],
    cta: "Use Scan Pass",
    href: "/ops/bartender",
    tone: "ready",
  },
  {
    icon: Smartphone,
    name: "Bar Mode",
    status: "Available now / Beta",
    description: "A focused view for staff working the bar — built for fast scanning, clear confirmations, and fewer mistakes.",
    tags: ["Mobile-first", "Staff-friendly", "Duplicate protection", "Built for live events"],
    cta: "Open Bar Mode",
    href: "/ops/bartender",
    tone: "ready",
  },
  {
    icon: Search,
    name: "Guest Lookup",
    status: "Available now",
    description: "For smaller events or edge cases, staff can search the guest list and redeem a ticket manually.",
    tags: ["Search by guest", "Manual confirmation", "Perfect backup flow", "Still fully tracked"],
    cta: "Search guests",
    href: "/ops/bartender",
    tone: "ready",
  },
  {
    icon: ClipboardList,
    name: "Bar Ledger",
    status: "Available now",
    description: "A live record of every drink ticket used during the event.",
    tags: ["Who redeemed what", "When it happened", "How many remain", "Export-ready history"],
    cta: "View Bar Ledger",
    href: "/ops/bartender",
    tone: "ready",
  },
  {
    icon: Ticket,
    name: "TapStation",
    status: "Launching soon / Private testing",
    description: "The bar experience, without the bottleneck. Guests tap, staff confirm, Sera tracks the rest.",
    tags: ["NFC-powered", "Private testing", "Built for high-flow bars", "No setup required"],
    cta: "Request TapStation access",
    href: "/request-access",
    tone: "soon",
  },
  {
    icon: Globe,
    name: "TapMarkers",
    status: "Future premium add-on",
    description: "Pre-configured NFC markers for venues, bars, and premium hosted events.",
    tags: ["Ready to place", "Pre-configured by Sera", "Connected to TapStation", "No setup required"],
    cta: "Coming soon",
    href: null,
    tone: "future",
  },
];

const statusStyles: Record<string, string> = {
  ready: "border-sera-moss/25 bg-sera-moss/10 text-sera-moss",
  soon: "border-sera-oxblood/25 bg-sera-oxblood/10 text-sera-oxblood",
  future: "border-sera-sand/70 bg-sera-beige/55 text-sera-warm-grey",
};

export default function Platform() {
  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader
          title="Everything for the evening, in one place"
          description="From first invitation to final pour, Sera keeps every moment aligned with your brand and pace."
        />
      </SeraContainer>

      <SeraSection spacing="large">
        <SeraContainer>
          <div className="grid gap-10 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="space-y-3 border-t border-[#e7d8c4]/20 pt-5"
              >
                <feature.icon className="h-5 w-5 text-[#e2cbb2]" strokeWidth={1.5} />
                <h2 className="font-display text-[1.7rem] leading-[1] tracking-[-0.02em] text-[#f1e7d9]">{feature.title}</h2>
                <p className="text-[0.98rem] leading-[1.75] text-[#d6cab9]">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </SeraContainer>
      </SeraSection>

      <SeraSection spacing="large" className="bg-sera-ivory text-sera-ink">
        <SeraContainer>
          <div className="mb-10 grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="sera-label mb-4 text-sera-oxblood">Drink ticket redemption</p>
              <h2 className="font-display text-4xl leading-[0.96] tracking-[-0.035em] text-sera-navy sm:text-5xl">
                Redeem drink tickets without slowing down the bar.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-[1.8] text-sera-warm-grey sm:text-lg">
              Start with Scan Pass, Bar Mode, or Guest Lookup. Every redemption is tracked in real time, so hosts always know who has used what — and how many tickets remain.
            </p>
          </div>

          <div className="mb-8 grid gap-3 rounded-[28px] border border-sera-sand/70 bg-sera-beige/45 p-4 text-sm text-sera-navy shadow-soft md:grid-cols-3">
            <div className="rounded-2xl bg-sera-ivory/85 p-4">
              <p className="sera-label text-sera-moss">Available now</p>
              <p className="mt-2 font-serif text-2xl text-sera-navy">Scan Pass, Bar Mode, Guest Lookup, Bar Ledger</p>
            </div>
            <div className="rounded-2xl bg-sera-ivory/70 p-4">
              <p className="sera-label text-sera-oxblood">Launching soon</p>
              <p className="mt-2 font-serif text-2xl text-sera-navy">TapStation private testing</p>
            </div>
            <div className="rounded-2xl bg-sera-ivory/55 p-4">
              <p className="sera-label text-sera-warm-grey">Future premium add-on</p>
              <p className="mt-2 font-serif text-2xl text-sera-navy">TapMarkers by Sera</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {redemptionOptions.map((option, index) => (
              <motion.article
                key={option.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.42, delay: index * 0.045 }}
                className="group flex min-h-[360px] flex-col rounded-[30px] border border-sera-sand/80 bg-sera-surface-light p-6 shadow-[0_24px_70px_-48px_rgba(8,14,28,0.72)] transition duration-200 hover:-translate-y-1 hover:border-sera-oxblood/30 hover:shadow-[0_28px_82px_-52px_rgba(8,14,28,0.82)]"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-sera-sand/70 bg-sera-beige/55 p-3 text-sera-oxblood">
                    <option.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${statusStyles[option.tone]}`}>
                    {option.status}
                  </span>
                </div>
                <h3 className="font-display text-[2rem] leading-[0.95] tracking-[-0.03em] text-sera-navy">{option.name}</h3>
                <p className="mt-4 text-[0.98rem] leading-[1.72] text-sera-ink/78">{option.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {option.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-sera-sand/65 bg-sera-beige/40 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-sera-warm-grey">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-7">
                  {option.href ? (
                    <Link
                      to={option.href}
                      className="inline-flex rounded-full border border-sera-navy/15 bg-sera-navy px-4 py-2 text-sm font-medium text-sera-ivory transition hover:bg-sera-oxblood"
                    >
                      {option.cta}
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-sera-sand bg-sera-beige/70 px-4 py-2 text-sm font-medium text-sera-warm-grey">
                      {option.cta}
                    </span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
