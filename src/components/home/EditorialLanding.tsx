import { Link } from "react-router-dom";

const moments = [
  { label: "New York", detail: "September 18 · Private Supper" },
  { label: "Paris", detail: "October 07 · Salon Evening" },
  { label: "Milan", detail: "November 02 · After Hours" },
];

export default function EditorialLanding() {
  return (
    <div className="relative overflow-hidden bg-sera-paper text-sera-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-sera-rose/70 via-sera-paper to-transparent" />

      <main id="main-content" className="relative mx-auto max-w-6xl px-6 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="max-w-3xl space-y-7">
            <p className="font-sans text-[0.69rem] uppercase tracking-[0.22em] text-sera-moss/90">Sera Society · By Invitation</p>

            <h1 className="font-display text-5xl tracking-display text-sera-ink sm:text-6xl md:text-7xl">
              Evenings for those who are expected, never announced.
            </h1>

            <p className="max-w-xl font-sans text-base leading-relaxed text-sera-ink/70 md:text-lg">
              A quieter calendar of dinners, salons, and after-hours gatherings hosted with precision and warmth.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/request-access"
                className="rounded-full bg-sera-ink px-6 py-3 text-sm font-medium text-sera-cloud transition hover:bg-sera-ink/90"
              >
                Request Consideration
              </Link>
              <Link
                to="/about"
                className="rounded-full border border-sera-line bg-sera-cloud/60 px-6 py-3 text-sm font-medium text-sera-ink transition hover:bg-sera-cloud"
              >
                Read the Journal
              </Link>
            </div>
          </div>

          <aside className="rounded-xl3 border border-sera-line bg-sera-cloud/80 p-6 shadow-sera-soft backdrop-blur-sm md:p-8">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-sera-moss">A Note from the House</p>
            <p className="mt-4 font-display text-3xl tracking-display text-sera-ink">Hospitality first.</p>
            <p className="mt-4 font-sans text-sm leading-relaxed text-sera-ink/70">
              We host thoughtfully, seat intentionally, and keep each room intimate. Membership is limited each season.
            </p>
          </aside>
        </section>

        <section className="mt-16 grid gap-6 md:mt-20 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <article className="rounded-xl2 border border-sera-line bg-sera-blush/45 p-6 md:p-8">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-sera-moss">The Next Rooms</p>
            <ol className="mt-5 space-y-4">
              {moments.map((moment) => (
                <li key={moment.label} className="border-b border-sera-line/80 pb-4 last:border-none last:pb-0">
                  <p className="font-display text-2xl tracking-display">{moment.label}</p>
                  <p className="mt-1 font-sans text-sm text-sera-ink/65">{moment.detail}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="grid min-h-[280px] content-between rounded-xl4 border border-sera-line bg-sera-cloud p-7 shadow-sera md:p-10">
            <p className="max-w-2xl font-display text-3xl tracking-display text-sera-ink md:text-4xl">
              The city should feel different when the right table is waiting.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-sera-line pt-5">
              <p className="font-sans text-sm text-sera-ink/65">Applications reviewed weekly · Limited admissions</p>
              <Link to="/request-access" className="font-sans text-sm uppercase tracking-[0.14em] text-sera-ink hover:text-sera-moss">
                Enter Request
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
