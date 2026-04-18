import { ContainerScrollAnimation } from "@/components/ui/container-scroll-animation";

const storyMoments = [
  {
    title: "Invite delivered",
    detail: "Curated visuals and guest details arrive with zero friction.",
  },
  {
    title: "Arrival recognized",
    detail: "Fast check-in and role-based access keep the entry line moving.",
  },
  {
    title: "Service stays seamless",
    detail: "Teams coordinate redemptions and experiences from one live flow.",
  },
];

export default function ScrollStorySection() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="sera-label mb-4 text-sera-stone">Guest Journey</p>
          <h2 className="sera-heading text-3xl sm:text-4xl">One guest journey, end to end</h2>
          <p className="sera-body mt-4 text-sm text-sera-warm-grey sm:text-base">
            Scroll through how Sera Society keeps every touchpoint elevated, from invite launch to in-event service.
          </p>
        </div>

        <ContainerScrollAnimation
          containerClassName="rounded-3xl border border-border/60 bg-card/40"
          className="px-4 py-6 sm:px-6 sm:py-8"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="rounded-2xl border border-border/50 bg-background/95 p-4 sm:p-6">
              <p className="sera-label mb-4 text-sera-warm-grey">Story Preview</p>
              <div className="grid grid-cols-2 gap-3">
                <img
                  src="/invite-mockups/editorial-minimal.svg"
                  alt="Minimal event invitation layout"
                  className="h-44 w-full rounded-xl border border-border/50 object-cover sm:h-52"
                  loading="lazy"
                />
                <img
                  src="/invite-mockups/fashion-forward.svg"
                  alt="Fashion-forward invitation design"
                  className="h-44 w-full rounded-xl border border-border/50 object-cover sm:h-52"
                  loading="lazy"
                />
                <img
                  src="/invite-mockups/formal-gala.svg"
                  alt="Formal gala invitation design"
                  className="col-span-2 h-48 w-full rounded-xl border border-border/50 object-cover sm:h-56"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/95 p-4 sm:p-6">
              <p className="sera-label mb-4 text-sera-warm-grey">Operational Flow</p>
              <ol className="space-y-4">
                {storyMoments.map((moment, index) => (
                  <li key={moment.title} className="rounded-xl border border-border/60 p-4">
                    <p className="sera-label text-sera-warm-grey">Step {index + 1}</p>
                    <h3 className="sera-subheading mt-2 text-xl text-foreground">{moment.title}</h3>
                    <p className="sera-body mt-2 text-sm text-sera-warm-grey">{moment.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </ContainerScrollAnimation>
      </div>
    </section>
  );
}
