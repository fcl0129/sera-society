import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function EventPages() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Event Pages</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              A page your guests
              <br /><span className="italic">actually visit</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              Every event gets a beautiful, branded page with all the details — RSVP, location, schedule, dress code, and more.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="bg-sera-navy p-8 md:p-12 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center max-w-md mx-auto">
              <p className="sera-label text-sera-stone text-[9px] mb-6">Sera Event Page</p>
              <h3 className="sera-heading text-sera-ivory text-3xl mb-2">The Grand Opening</h3>
              <p className="sera-body text-sera-sand text-sm mb-6">Saturday, July 12, 2026 · 7 PM</p>
              <div className="w-12 h-px bg-sera-oxblood mx-auto mb-6" />
              <p className="sera-body text-sera-stone text-xs mb-4">The Wythe Hotel · Brooklyn, NY</p>
              <p className="sera-body text-sera-stone text-xs mb-8">Cocktail Attire · Complimentary Drinks</p>
              <div className="inline-block px-8 py-3 border border-sera-sand/40 text-sera-sand text-xs tracking-widest uppercase">
                RSVP Now
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {["Event details & schedule", "RSVP with guest count", "Map & directions", "Dress code guidance", "Host message", "Share via link"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border border-sera-sand/50 bg-sera-ivory/50">
                <div className="w-1.5 h-1.5 rounded-full bg-sera-oxblood flex-shrink-0" />
                <span className="sera-body text-sera-navy text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="sera" size="lg" asChild>
              <Link to="/dashboard/events">Create Event</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
