import TierSection from "@/components/TierSection";
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
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TierSection />
      <FeaturesSection />
      <InvitationShowcase />
      <OperationsShowcase />
      <MobileSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
