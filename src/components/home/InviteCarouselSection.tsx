import { HeroSection } from "@/components/ui/feature-carousel";

const invitationMockups = [
  {
    src: "/invite-mockups/editorial-minimal.svg",
    alt: "Editorial minimal invitation mockup for an intimate dinner",
  },
  {
    src: "/invite-mockups/dramatic-poster.svg",
    alt: "Dramatic poster style invitation mockup for late night events",
  },
  {
    src: "/invite-mockups/social-sunset.svg",
    alt: "Social rooftop sunset invitation mockup",
  },
  {
    src: "/invite-mockups/formal-gala.svg",
    alt: "Formal gala invitation mockup",
  },
  {
    src: "/invite-mockups/fashion-forward.svg",
    alt: "Fashion-forward invitation mockup for a premiere",
  },
];

export default function InviteCarouselSection() {
  return (
    <HeroSection
      title={
        <>
          Sera invitation mockups
          <br />
          <span className="italic text-sera-oxblood">ready for your next guest list</span>
        </>
      }
      subtitle="Preview your invite styles in a premium carousel and choose the visual tone that fits your event — from formal dinners to after-dark drops."
      images={invitationMockups}
      className="sera-surface-warm"
    />
  );
}
