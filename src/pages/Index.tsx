import Navbar from "@/components/Navbar";
import EditorialLanding from "@/components/home/EditorialLanding";

export default function Index() {
  return (
    <div className="min-h-screen bg-sera-paper text-sera-ink">
      <Navbar />
      <EditorialLanding />
    </div>
  );
}
