const experiencePillars = [
  { title: "Invite", detail: "Beautiful invitations, effortlessly sent" },
  { title: "Arrive", detail: "Guests check in with a simple tap" },
  { title: "Enjoy", detail: "Everything flows — from arrival to last drink" },
];

export default function ExperienceSection() {
  return (
    <section className="sera-section">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="sera-label mb-3 text-sera-stone">The Experience</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {experiencePillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-white/10 bg-black/20 p-7 shadow-[0_14px_50px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-8"
            >
              <h3 className="sera-subheading text-2xl leading-tight tracking-wide text-sera-ivory">
                {pillar.title}
              </h3>
              <p className="sera-body mt-2 text-sm leading-relaxed text-sera-sand md:text-[14px]">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
