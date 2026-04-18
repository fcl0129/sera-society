import TierSection from "@/components/TierSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import HeroSection from "@/components/home/HeroSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import InvitationShowcase from "@/components/home/InvitationShowcase";
import OperationsShowcase from "@/components/home/OperationsShowcase";
import MobileSection from "@/components/home/MobileSection";
import CtaSection from "@/components/home/CtaSection";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main id="main-content">
        <HeroSection />

        <ExperienceSection />
        <FeaturesSection />
        <InvitationShowcase />
        <OperationsShowcase />
        <MobileSection />

        <TierSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
