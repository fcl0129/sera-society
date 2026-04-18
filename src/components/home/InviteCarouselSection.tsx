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

const invitationDescriptions = [
  {
    heading: "Editorial Minimal",
    description:
      "A clean, understated layout for intimate dinners and private gatherings where typography carries the mood.",
  },
  {
    heading: "After Dark Poster",
    description:
      "Bold contrast and cinematic tone designed for late-night programming, afterparties, and high-energy launch nights.",
  },
  {
    heading: "Rooftop Sunset Session",
    description:
      "Warm gradients and soft composition for golden-hour socials, rooftop mixers, and relaxed summer programming.",
  },
  {
    heading: "Formal Gala",
    description:
      "Refined spacing and classic hierarchy suited to black-tie dinners, benefit galas, and premium member experiences.",
  },
  {
    heading: "Fashion Forward Premiere",
    description:
      "Directional styling with editorial rhythm for runway moments, premieres, and culture-led brand collaborations.",
  },
];

export default function InviteCarouselSection() {
  return (
    <HeroSection
      title={null}
      subtitle=""
      images={invitationMockups}
      slideDetails={invitationDescriptions}
      className="sera-surface-warm"
    />
  );
}
