import { Link } from "react-router-dom";

type Tier = {
  title: string;
  label: string;
  badge?: string;
  copyHeadline: string;
  copySub: string;
  cta: string;
  href: string;
  tone?: "default" | "highlight" | "dim";
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
  },
  {
    title: "SERA HOST",
    label: "Early access",
    copyHeadline: "Run events with precision",
    copySub: "Built for teams, not just hosts",
    cta: "Request access",
    href: "/request-access",
    tone: "dim",
  },
  {
    title: "SERA OCCASIONS",
    label: "By request",
    copyHeadline: "For moments that deserve perfection",
    copySub: "Designed for events you’ll never repeat",
    cta: "Request access",
    href: "/request-access",
    tone: "dim",
  },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function TierCard({ tier }: { tier: Tier }) {
  const isHighlight = tier.tone === "highlight";
  const isDim = tier.tone === "dim";

  return (
    <div
      className={cx(
        "group relative rounded-2xl border p-7 md:p-8",
        "bg-white/[0.04] border-white/10",
        "shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_22px_80px_rgba(0,0,0,0.55)]",
        isDim && "opacity-70 hover:opacity-85",
        isHighlight &&
          "border-white/25 shadow-[0_18px_60px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.10),0_0_60px_rgba(120,140,255,0.10)]"
      )}
    >
      {isHighlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.14), 0 0 90px rgba(120,140,255,0.18)",
          }}
        />
      )}

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
                "shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
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
      </div>
    </div>
  );
}

export default function TierSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050814] to-black" />
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(900px_500px_at_50%_10%,rgba(120,140,255,0.10),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(700px_450px_at_10%_40%,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="sera-label text-sera-stone mb-3">Tiers</p>
          <h2 className="sera-subheading text-sera-ivory text-3xl md:text-4xl leading-tight">
            A premium set of tiers — designed for the night.
          </h2>
          <p className="sera-body text-sera-sand mt-4 text-sm md:text-base leading-relaxed">
            Minimal, editorial, and cinematic — built around how events actually run.
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
