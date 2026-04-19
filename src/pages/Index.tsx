import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LandingRebuild from "@/components/home/LandingRebuild";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main id="main-content">
        <LandingRebuild />
      </main>

      <Footer />
    </div>
  );
}
