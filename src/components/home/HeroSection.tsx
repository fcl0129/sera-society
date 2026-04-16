import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Base: dark-to-beige cinematic gradient (smooth, no harsh band) */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px 520px at 50% 0%, rgba(120,140,255,0.10), transparent 60%),
            radial-gradient(800px 520px at 0% 40%, rgba(255,255,255,0.06), transparent 55%),
            linear-gradient(
              180deg,
              hsl(var(--sera-navy)) 0%,
              hsl(var(--sera-deep-navy)) 68%,
              hsl(var(--sera-beige)) 100%
            )
          `,
        }}
      />

      {/* Subtle dotted texture (very light) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--sera-ivory)) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Bottom vignette to avoid “gray band” feeling */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
        style={{
          background:
            "radial-gradient(1200px 220px at 50% 100%, rgba(0,0,0,0.18), transparent 70%)",
        }}
      />

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
