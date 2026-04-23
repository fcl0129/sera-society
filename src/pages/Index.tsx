import { Link } from "react-router-dom";

import { AmbientBackground } from "@/components/sera/ambient-background";
import { SiteHeader } from "@/components/sera/site-header";

const pillars = [
  {
    title: "Invitations with presence",
    copy: "Editorial invitations and private event pages that communicate mood before anyone arrives.",
  },
  {
    title: "Guests handled with calm",
    copy: "Approvals, circles, and notes in one quiet flow so every entrance feels expected.",
  },
  {
    title: "Service that stays discreet",
    copy: "QR and NFC ticket redemption built for bars and floor teams without interrupting the room.",
  },
] as const;

export default function Index() {
  return (
    <AmbientBackground className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="px-6 pb-24 pt-32 md:px-10 md:pt-40">
        <section className="mx-auto max-w-6xl">
          <p className="max-w-xl text-[0.66rem] uppercase tracking-[0.32em] text-[#decfbf]/75">
            Sera Society · Private Event Hosting
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-[clamp(2.9rem,8.4vw,7.2rem)] leading-[0.9] tracking-[-0.02em] text-[#f4eadb]">
            Evenings remembered for how they felt, not how they were managed.
          </h1>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-[#d8cbba] md:ml-16 md:text-[1.15rem]">
            Sera Society is a curated hosting platform for invitation-led gatherings, where guest flow, check-in, and drink ticket
            service are designed to disappear into the atmosphere of the night.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 md:ml-16">
            <Link
              to="/request-access"
              className="inline-flex h-11 items-center border border-[#f4e6d2]/70 bg-[#efe2cf] px-6 text-[0.74rem] uppercase tracking-[0.18em] text-[#2b2320] transition hover:bg-[#f6ecdc]"
            >
              Request access
            </Link>
            <Link
              to="/platform"
              className="inline-flex h-11 items-center border border-[#e4d5c2]/35 bg-[#f2e5d4]/5 px-6 text-[0.74rem] uppercase tracking-[0.18em] text-[#f2e8da] transition hover:bg-[#f1e4d2]/12"
            >
              Explore the platform
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-6xl border-y border-[#eadbc8]/15 py-16 md:mt-28 md:py-20">
          <div className="grid gap-14 md:grid-cols-3 md:gap-10">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="space-y-4">
                <h2 className="font-display text-[2rem] leading-[0.92] tracking-[-0.015em] text-[#efe4d3]">{pillar.title}</h2>
                <p className="text-sm leading-relaxed text-[#d6c9b8] md:text-base">{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 grid max-w-6xl gap-8 md:mt-24 md:grid-cols-[1.2fr_auto] md:items-end">
          <h2 className="max-w-4xl font-display text-[clamp(2.2rem,5.8vw,5rem)] leading-[0.9] tracking-[-0.02em] text-[#2f2522]">
            A quieter, more intentional way to host invitations, arrivals, and the moments in between.
          </h2>
          <Link
            to="/contact"
            className="inline-flex h-11 items-center justify-center border border-[#5f4a42]/40 px-6 text-[0.72rem] uppercase tracking-[0.2em] text-[#44342f] transition hover:bg-[#fff7ec]/35"
          >
            Speak with our team
          </Link>
        </section>
      </main>
    </AmbientBackground>
  );
}
