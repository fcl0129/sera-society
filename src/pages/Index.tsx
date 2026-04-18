import TierSection from "@/components/TierSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import InviteCarouselSection from "@/components/home/InviteCarouselSection";
import OperationsShowcase from "@/components/home/OperationsShowcase";
import MobileSection from "@/components/home/MobileSection";
import CtaSection from "@/components/home/CtaSection";
import { DemoOne } from "@/components/ui/demo";

export default function Index() {
  return (
   <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <HeroSection />

      <DemoOne />

      {/* Tier plans */}
      <TierSection />

      <FeaturesSection />

      <InviteCarouselSection />

      <OperationsShowcase />
      <MobileSection />
      <CtaSection />

      <Footer />
    </div>
  );
}
