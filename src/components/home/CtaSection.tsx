import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section className="sera-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="rounded-3xl border border-white/50 bg-white/65 px-5 py-12 text-center backdrop-blur-sm sm:px-10 sm:py-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="sera-label mb-5 text-sera-oxblood">Ready to launch?</p>
          <h2 className="sera-heading text-3xl text-sera-navy sm:text-4xl">
            Bring your next event into one cohesive operating system
          </h2>
          <p className="sera-body mx-auto mt-4 max-w-2xl text-sm text-sera-warm-grey sm:text-base">
            Tell us how you host and we’ll map the right Sera setup for your team, guest volume,
            and event format.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="sera" size="xl" className="w-full sm:w-auto" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button variant="sera-outline" size="xl" className="w-full sm:w-auto" asChild>
              <Link to="/login">Organizer Login</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
