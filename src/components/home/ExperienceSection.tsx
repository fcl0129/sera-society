export default function ExperienceSection() {
  return (
    <section className="py-14 md:py-18">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="sera-label text-sera-stone mb-3">THE EXPERIENCE</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-7 md:p-8 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
            <h3 className="sera-subheading text-sera-ivory text-2xl leading-tight tracking-wide">
              Invite
            </h3>
            <p className="sera-body text-sera-sand mt-2 text-sm md:text-[14px] leading-relaxed">
              Beautiful invitations, effortlessly sent
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-7 md:p-8 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
            <h3 className="sera-subheading text-sera-ivory text-2xl leading-tight tracking-wide">
              Arrive
            </h3>
            <p className="sera-body text-sera-sand mt-2 text-sm md:text-[14px] leading-relaxed">
              Guests check in with a simple tap
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-7 md:p-8 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
            <h3 className="sera-subheading text-sera-ivory text-2xl leading-tight tracking-wide">
              Enjoy
            </h3>
            <p className="sera-body text-sera-sand mt-2 text-sm md:text-[14px] leading-relaxed">
              Everything flows — from arrival to last drink
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
