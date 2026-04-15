import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScanLine, Smartphone, Beer, UserCheck, Wifi, ShieldCheck } from "lucide-react";

const tools = [
  { icon: ScanLine, title: "QR Scanning", desc: "Every guest gets a unique QR code. Staff scan at the door for instant validation." },
  { icon: Wifi, title: "NFC Tap-In", desc: "Guests tap their phone at NFC-enabled checkpoints for frictionless entry." },
  { icon: UserCheck, title: "Live Guest Status", desc: "Real-time check-in dashboard showing arrivals, pending guests, and walk-ins." },
  { icon: Beer, title: "Drink Ticket Redemption", desc: "Bartenders scan QR or tap NFC to redeem drink tickets — tracked in real time." },
  { icon: Smartphone, title: "Staff Mobile Views", desc: "Purpose-built mobile views for door staff, bartenders, and organizers." },
  { icon: ShieldCheck, title: "Access Roles", desc: "Assign roles to staff — organizer, door, bartender — each with the right permissions." },
];

export default function CheckIn() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Check-In & Operations</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              Built for the night
              <br /><span className="italic">it matters most</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              QR scanning, NFC tap-in, drink-ticket redemption, and live guest management — all from your phone.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                className="p-8 border border-sera-sand/60 hover:border-sera-navy/20 bg-sera-ivory/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <tool.icon className="w-6 h-6 text-sera-oxblood mb-4" strokeWidth={1.5} />
                <h3 className="sera-subheading text-sera-navy text-lg mb-2">{tool.title}</h3>
                <p className="sera-body text-sera-warm-grey text-sm">{tool.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="sera" size="lg" asChild>
              <Link to="/login">Access Check-In Tools</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
