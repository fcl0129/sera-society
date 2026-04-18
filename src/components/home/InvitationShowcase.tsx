import { motion } from "framer-motion";
import { Layers, Type, Image, Sparkles } from "lucide-react";

const showcaseItems = [
  {
    icon: Layers,
    title: "Multiple layout options",
    desc: "Choose from editorial, minimal, bold, or custom layouts for every occasion.",
  },
  {
    icon: Type,
    title: "Typography freedom",
    desc: "Pair serif headlines with clean body text. Your invitation, your typographic voice.",
  },
  {
    icon: Image,
    title: "Graphic flyer mode",
    desc: "Go beyond invitations — design full graphic flyers for club nights, launches, and parties.",
  },
  {
    icon: Sparkles,
    title: "Curated starting points",
    desc: "Begin from refined invitation directions, then shape every detail to your event voice.",
  },
];

/* Five visually distinct invitation examples */
const invitationExamples = [
  {
    id: "editorial",
    label: "Editorial Minimal",
    bg: "bg-sera-navy",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <p className="sera-label text-sera-stone text-[8px] mb-6 tracking-[0.2em]">You're Invited</p>
        <h3 className="sera-heading text-sera-ivory text-2xl sm:text-3xl mb-3">
          A Midsummer
          <br />
          <span className="italic">Evening</span>
        </h3>
        <div className="w-10 h-px bg-sera-oxblood my-5" />
        <p className="sera-body text-sera-sand text-xs mb-1">June 21, 2026 · 8 PM</p>
        <p className="sera-body text-sera-stone text-[10px]">The Glasshouse · Brooklyn, NY</p>
        <div className="mt-6 px-5 py-1.5 border border-sera-sand/40 text-sera-sand text-[9px] tracking-[0.2em] uppercase">
          RSVP
        </div>
      </div>
    ),
  },
  {
    id: "poster",
    label: "Dramatic Poster",
    bg: "bg-sera-charcoal",
    content: (
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div>
          <p className="font-sans text-sera-oxblood-soft text-[9px] font-bold tracking-[0.3em] uppercase">Live Event</p>
        </div>
        <div>
          <h3 className="sera-accent-serif text-sera-ivory text-4xl sm:text-5xl font-light leading-[0.95] mb-3">
            AFTER
            <br />
            <span className="italic text-sera-oxblood-soft">DARK</span>
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-sera-stone/30" />
            <span className="text-sera-stone text-[8px] tracking-[0.15em] uppercase">Vol. III</span>
            <div className="h-px flex-1 bg-sera-stone/30" />
          </div>
          <p className="font-sans text-sera-sand text-[10px] font-medium">SAT 08.15 · 10PM — LATE</p>
          <p className="font-sans text-sera-stone text-[9px] mt-1">Warehouse 9 · Downtown LA</p>
        </div>
      </div>
    ),
  },
  {
    id: "social",
    label: "Social Invite",
    bg: "bg-gradient-to-br from-sera-oxblood to-sera-oxblood-soft",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-sera-ivory/30 flex items-center justify-center mb-5">
          <span className="sera-accent-serif text-sera-ivory text-2xl italic">S</span>
        </div>
        <p className="font-sans text-sera-ivory/70 text-[9px] tracking-[0.2em] uppercase mb-3">Join Us For</p>
        <h3 className="sera-accent-serif text-sera-ivory text-2xl font-light mb-1">Rooftop Sunset</h3>
        <p className="sera-accent-serif text-sera-ivory/60 text-lg italic mb-4">Session</p>
        <p className="font-sans text-sera-ivory/80 text-[10px] font-medium">July 4 · Golden Hour</p>
        <p className="font-sans text-sera-ivory/50 text-[9px] mt-1">Atelier Terrace · East Village</p>
        <div className="mt-5 px-6 py-2 bg-sera-ivory/10 backdrop-blur-sm text-sera-ivory text-[9px] tracking-[0.15em] uppercase">
          I'm In
        </div>
      </div>
    ),
  },
  {
    id: "formal",
    label: "Formal Dinner",
    bg: "bg-sera-ivory",
    content: (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-4 border border-sera-navy/15" />
        <div className="absolute inset-6 border border-sera-navy/8" />
        <p className="font-sans text-sera-warm-grey text-[8px] tracking-[0.25em] uppercase mb-5 relative z-10">The Pleasure of Your Company</p>
        <h3 className="sera-accent-serif text-sera-navy text-2xl font-light leading-tight mb-2 relative z-10">
          Annual Gala
          <br />
          <span className="italic text-sera-oxblood">Dinner</span>
        </h3>
        <div className="w-6 h-px bg-sera-navy/30 my-4 relative z-10" />
        <p className="sera-accent-serif text-sera-navy/70 text-xs italic mb-1 relative z-10">Saturday, the Twelfth of September</p>
        <p className="sera-accent-serif text-sera-navy/50 text-[10px] italic relative z-10">Two Thousand Twenty-Six</p>
        <p className="font-sans text-sera-warm-grey text-[9px] mt-4 relative z-10">Black Tie · 7 o'clock</p>
        <div className="mt-4 px-5 py-1.5 border border-sera-navy/20 text-sera-navy text-[9px] tracking-[0.15em] uppercase relative z-10">
          Respond
        </div>
      </div>
    ),
  },
  {
    id: "fashion",
    label: "Fashion Forward",
    bg: "bg-sera-deep-navy",
    content: (
      <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
        <div className="absolute top-5 right-5">
          <div className="w-8 h-8 border border-sera-sand/30 rotate-45" />
        </div>
        <p className="font-sans text-sera-moss-muted text-[8px] tracking-[0.3em] uppercase mb-2">Exclusive Preview</p>
        <h3 className="sera-accent-serif text-sera-ivory text-3xl sm:text-4xl font-light leading-[0.95] mb-1">
          MAISON
        </h3>
        <h3 className="sera-accent-serif text-sera-sand text-xl italic mb-4">
          Première
        </h3>
        <div className="w-full h-px bg-gradient-to-r from-sera-sand/40 to-transparent mb-3" />
        <div className="flex items-baseline gap-3">
          <span className="font-sans text-sera-ivory text-[10px] font-medium tracking-wider">09.20.26</span>
          <span className="text-sera-stone text-[8px]">·</span>
          <span className="font-sans text-sera-stone text-[9px]">8 PM</span>
        </div>
        <p className="font-sans text-sera-stone text-[9px] mt-1">Atelier No. 9 · NYC</p>
      </div>
    ),
  },
];

export default function InvitationShowcase() {
  return (
    <section className="sera-section sera-surface-warm">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="sera-label text-sera-oxblood mb-4">Visual Direction</p>
          <h2 className="sera-heading text-sera-navy text-3xl md:text-5xl mb-4">
            Design invitations that
            <br />
            <span className="italic">feel authored</span>
          </h2>
          <p className="sera-body text-sera-warm-grey max-w-xl mx-auto">
            From restrained black-tie notes to energetic late-night posters, every composition
            is intentionally built to carry your brand language.
          </p>
        </motion.div>

        {/* Invitation examples — 5 distinct styles in a grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {invitationExamples.map((inv, i) => (
            <motion.div
              key={inv.id}
              className={`relative aspect-[3/4.5] ${inv.bg} overflow-hidden group cursor-pointer`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
            >
              {inv.content}
              {/* Hover overlay with label */}
              <div className="absolute inset-0 bg-sera-navy/0 group-hover:bg-sera-navy/60 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                <span className="font-sans text-sera-ivory text-[9px] tracking-[0.15em] uppercase">{inv.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseItems.map((item, i) => (
            <motion.div
              key={item.title}
              className="flex gap-4 items-start"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
            >
              <div className="w-10 h-10 bg-sera-navy/5 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-sera-oxblood" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-sans text-sm font-medium text-sera-navy mb-1">{item.title}</h4>
                <p className="sera-body text-sera-warm-grey text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
