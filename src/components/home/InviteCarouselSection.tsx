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
      title={null}
      subtitle=""
      images={invitationMockups}
      className="sera-surface-warm"
    />
  );
}
