import React from "react";

import { HeroSection } from "@/components/ui/feature-carousel";

const Demo: React.FC = () => {
  const images = [
    { src: "/invite-mockups/editorial-minimal.svg", alt: "Editorial minimal invitation" },
    { src: "/invite-mockups/dramatic-poster.svg", alt: "Dramatic poster invitation" },
    { src: "/invite-mockups/social-sunset.svg", alt: "Social rooftop invitation" },
    { src: "/invite-mockups/formal-gala.svg", alt: "Formal gala invitation" },
    { src: "/invite-mockups/fashion-forward.svg", alt: "Fashion-forward invitation" },
  ];

  const title = (
    <>
      Build your next <span className="italic text-sera-oxblood">Sera Society invite</span>
    </>
  );

  return (
    <div className="w-full">
      <HeroSection
        title={title}
        subtitle="Carousel preview for your invitation mockups and campaign-ready layouts."
        images={images}
      />
    </div>
  );
};

export default Demo;
