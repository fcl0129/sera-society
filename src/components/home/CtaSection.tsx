import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section className="py-24 md:py-32 sera-surface-warm">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="sera-label text-sera-oxblood mb-6">For Those Who Host Differently</p>
          <h2 className="sera-heading text-sera-navy text-4xl md:text-5xl mb-6">
            Ready to elevate
            <br />
            <span className="italic">your next event?</span>
          </h2>
          <p className="sera-body text-sera-warm-grey mb-10 max-w-lg mx-auto">
            Sera is currently available by invitation. Request access to join organizers who are redefining how events are created and experienced.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="sera" size="xl" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
            <Button variant="sera-outline" size="xl" asChild>
              <Link to="/login">Organizer Login</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
