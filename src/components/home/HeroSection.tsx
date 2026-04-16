import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Base: dark-to-beige cinematic gradient */}
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

      {/* Subtle dotted texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Bottom vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
        style={{
          background:
            "radial-gradient(1200px 220px at 50% 100%, rgba(0,0,0,0.18), transparent 70%)",
        }}
      />

      {/* Content — force white text */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-32 text-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="sera-label text-white/70 mb-8">Sera Society</p>
        </motion.div>

        <motion.h1
