import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* Five visually distinct invitation template previews */
const templates = [
  {
    title: "Editorial Minimal",
    desc: "Serif-forward, airy, understated elegance",
    bg: "bg-sera-navy",
    inner: (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="sera-label text-sera-stone text-[7px] mb-4 tracking-[0.2em]">You're Invited</p>
        <h4 className="font-serif text-sera-ivory text-xl font-light mb-2">
          An Evening
          <br /><span className="italic">of Art</span>
        </h4>
        <div className="w-8 h-px bg-sera-oxblood my-3" />
        <p className="text-sera-sand text-[9px]">March 14 · 7 PM</p>
      </div>
    ),
  },
  {
    title: "Dramatic Poster",
    desc: "Bold type, high contrast, graphic energy",
    bg: "bg-sera-charcoal",
    inner: (
      <div className="flex flex-col justify-end h-full p-5">
        <p className="font-sans text-sera-oxblood-soft text-[7px] font-bold tracking-[0.3em] uppercase mb-1">Live</p>
        <h4 className="font-serif text-sera-ivory text-3xl font-light leading-[0.9] mb-2">
          NEON<br /><span className="italic text-sera-oxblood-soft">NIGHTS</span>
        </h4>
        <p className="font-sans text-sera-stone text-[8px]">SAT 10PM · Warehouse 9</p>
      </div>
    ),
  },
  {
    title: "Social Invite",
    desc: "Warm, image-led, casual-premium feel",
    bg: "bg-gradient-to-br from-sera-oxblood to-sera-oxblood-soft",
    inner: (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-sera-ivory/30 flex items-center justify-center mb-4">
          <span className="font-serif text-sera-ivory text-lg italic">R</span>
        </div>
        <h4 className="font-serif text-sera-ivory text-lg font-light">Rooftop Sunset</h4>
        <p className="font-serif text-sera-ivory/60 text-sm italic mb-3">Session</p>
        <p className="font-sans text-sera-ivory/70 text-[8px]">July 4 · Golden Hour</p>
      </div>
    ),
  },
  {
    title: "Formal Dinner",
    desc: "Classic borders, refined serif typography",
    bg: "bg-sera-ivory",
    inner: (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center relative">
        <div className="absolute inset-3 border border-sera-navy/15" />
        <p className="font-sans text-sera-warm-grey text-[7px] tracking-[0.2em] uppercase mb-3 relative z-10">The Pleasure of Your Company</p>
        <h4 className="font-serif text-sera-navy text-lg font-light relative z-10">Annual Gala <span className="italic text-sera-oxblood">Dinner</span></h4>
        <div className="w-6 h-px bg-sera-navy/20 my-3 relative z-10" />
        <p className="font-serif text-sera-navy/60 text-[9px] italic relative z-10">Black Tie · Seven o'clock</p>
      </div>
    ),
  },
  {
    title: "Fashion Forward",
    desc: "Asymmetric layout, modern editorial type",
    bg: "bg-sera-deep-navy",
    inner: (
      <div className="flex flex-col items-start justify-end h-full p-5">
        <p className="font-sans text-sera-moss-muted text-[7px] tracking-[0.3em] uppercase mb-1">Preview</p>
        <h4 className="font-serif text-sera-ivory text-2xl font-light leading-[0.9]">MAISON</h4>
        <p className="font-serif text-sera-sand text-sm italic mb-3">Première</p>
        <p className="font-sans text-sera-stone text-[8px]">09.20 · Soho House</p>
      </div>
    ),
  },
];

export default function Invitations() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Invitations</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              Design invitations
              <br /><span className="italic">worth opening</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              Create digital invitations and graphic flyers with full editorial control. Templates, typography, layouts — everything your event deserves.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-16">
            {templates.map((template, i) => (
              <motion.div
                key={template.title}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className={`aspect-[3/4.5] ${template.bg} overflow-hidden mb-3`}>
                  {template.inner}
                </div>
                <h4 className="font-sans text-sm font-medium text-sera-navy">{template.title}</h4>
                <p className="sera-body text-sera-warm-grey text-xs mt-0.5">{template.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="sera" size="lg" asChild>
              <Link to="/login">Start Designing</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
