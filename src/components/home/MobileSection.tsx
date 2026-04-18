import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mobilePoints = [
  "Readable, low-friction interfaces for low-light venues",
  "Fast host actions for check-in, verification, and exceptions",
  "Service-side redemption that prevents lag at the bar",
  "Shared event state across every station in motion",
];

export default function MobileSection() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="sera-label mb-4 text-sera-stone">Handheld control</p>
          <h2 className="sera-heading text-3xl text-sera-navy sm:text-4xl">Built for teams that run events on the move</h2>
          <p className="sera-body mt-4 text-sm text-sera-warm-grey sm:text-base">
            Every core workflow is mobile-first so hosts, door teams, and service operators can act
            confidently without returning to a desktop.
          </p>

          <ul className="mt-6 space-y-3">
            {mobilePoints.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sera-oxblood" />
                <span className="sera-body text-sm text-sera-warm-grey">{item}</span>
              </li>
            ))}
          </ul>

          <Button className="mt-8" variant="sera" size="lg" asChild>
            <Link to="/platform">See platform detail</Link>
          </Button>
        </motion.div>

        <motion.div
          className="mx-auto w-full max-w-sm rounded-[2rem] border border-white/40 bg-white/40 p-4 shadow-[0_24px_70px_-40px_rgba(16,24,40,0.6)] backdrop-blur-lg"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="overflow-hidden rounded-[1.5rem] bg-sera-deep-navy p-4">
            <p className="sera-label text-[10px] text-sera-stone">Live event console</p>
            <div className="mt-4 space-y-2">
              {[
                ["Maya Chen", "Checked in"],
                ["Alex Rivera", "Pending"],
                ["Jordan Lee", "VIP"],
              ].map(([name, status]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-xs text-sera-sand">{name}</span>
                  <span className="text-[10px] text-sera-stone">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
