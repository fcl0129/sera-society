import TierSection from "@/components/TierSection";
import SectionFade from "@/components/SectionFade";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import InvitationShowcase from "@/components/home/InvitationShowcase";
import OperationsShowcase from "@/components/home/OperationsShowcase";
import MobileSection from "@/components/home/MobileSection";
import CtaSection from "@/components/home/CtaSection";

export default function Index() {
  return (
    <div className="min-h-screen sera-gradient-navy">
      <Navbar />

      <HeroSection />
      <ExperienceSection />

      {/* tiers nära toppen så det känns som en del av “storyn” */}
      <TierSection />

      <FeaturesSection />

      {/* InvitationShowcase verkar vara “paper”-känsla → mjuk övergång ner i night */}
      <InvitationShowcase />
      <SectionFade />

      <OperationsShowcase />
      <MobileSection />
      <CtaSection />

      <Footer />
    </div>
  );
}
``
