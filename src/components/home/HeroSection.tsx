import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center sera-hero-gradient overflow-hidden">
      {/* Subtle dotted texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--sera-ivory)) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="sera-label text-sera-stone mb-8">Sera Society</p>
        </motion.div>

        <motion.h1
          className="sera-heading text-sera-ivory text-5xl md:text-7xl lg:text-8xl mb-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
          Events designed
          <br />
          <span className="italic font-light">to be remembered</span>
        </motion.h1>

        <motion.p
          className="sera-body text-sera-sand text-lg md:text-xl max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          A premium platform for creating, hosting, and managing modern events — from invitation
          design to night-of operations.
        </motion.p>

        <motion.p
          className="text-sera-stone text-xs italic font-serif mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          Sera — pronounced "seh-rah"
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Button variant="sera-ivory" size="xl" asChild>
            <Link to="/request-access">Request Access</Link>
          </Button>

          <Button variant="sera-outline" size="xl" asChild>
            <Link
              to="/platform"
              className="border-sera-sand text-sera-sand hover:bg-sera-ivory hover:text-sera-navy"
            >
              View Platform
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* ✅ Smooth fade from hero into the light beige page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 md:h-56"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, hsl(var(--background)) 100%)",
        }}
      />
    </section>
  );
}
