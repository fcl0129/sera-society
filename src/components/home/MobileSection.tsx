import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function MobileSection() {
  return (
    <section className="py-24 md:py-32 sera-surface-light">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="sera-label text-sera-moss mb-4">Handheld Control</p>
            <h2 className="sera-heading text-sera-navy text-3xl md:text-4xl mb-6">
              Built for movement,
              <br />
              <span className="italic">not desk-bound software</span>
            </h2>
            <p className="sera-body text-sera-warm-grey mb-6">
              From hosts at the door to bartenders on station, every workflow is tuned for fast
              interactions, legibility in low light, and confident decision-making in motion.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Guest RSVP & event narratives",
                "Host-side check-in control",
                "Bar redemption interface",
                "Door team verification",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-sera-oxblood" />
                  <span className="sera-body text-sera-navy text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Button variant="sera" size="lg" asChild>
              <Link to="/platform">Explore the Platform</Link>
            </Button>
          </motion.div>

          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-64 h-[520px] bg-sera-navy rounded-[2rem] border-4 border-sera-charcoal shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-sera-charcoal rounded-b-xl" />
              <div className="mt-10 px-5 py-6 space-y-4">
                <p className="sera-label text-sera-stone text-[9px]">Sera · Check-In</p>
                <h4 className="font-serif text-sera-ivory text-base font-light">Tonight's Event</h4>
                <div className="space-y-2">
                  {["Maya Chen — Checked in", "Alex Rivera — Pending", "Jordan Lee — VIP"].map((guest, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 border border-sera-ink/50 flex justify-between items-center"
                    >
                      <span className="text-sera-sand text-[10px]">{guest.split(" — ")[0]}</span>
                      <span className={`text-[9px] ${i === 0 ? "text-sera-moss-muted" : i === 2 ? "text-sera-oxblood-soft" : "text-sera-stone"}`}>
                        {guest.split(" — ")[1]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center py-3 border border-sera-sand/30 text-sera-sand text-[10px] tracking-widest uppercase">
                  Scan Next Guest
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
