import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqCategories = [
  {
    label: "General",
    items: [
      {
        q: "What is Sera?",
        a: "Sera is a premium event platform that combines beautiful invitation design and guest-facing event pages with practical event operations — guest management, RSVP tracking, digital drink tickets, check-in, and night-of tools. It's built for organizers who care about both aesthetics and execution.",
      },
      {
        q: "Who is Sera for?",
        a: "Sera is designed for event producers, creative directors, brand hosts, cultural curators, and anyone who hosts intentionally — from intimate dinners to large-scale parties. Whether you manage 30 guests or 3,000, Sera scales with you.",
      },
      {
        q: "How do I get access?",
        a: "Sera is currently available by invitation. You can request access through our website. We review each request and respond within a few business days.",
      },
    ],
  },
  {
    label: "Invitations & Design",
    items: [
      {
        q: "Can I design custom invitations?",
        a: "Yes. Sera gives you full creative control over your digital invitations and graphic flyers — including layout, typography, colors, and imagery. You can start from a premium template or build from scratch.",
      },
      {
        q: "Can I create flyers and posters, not just invitations?",
        a: "Absolutely. Sera supports both elegant invitation formats and bold graphic flyer styles. Whether you're hosting a private dinner or a club night, you can design the right visual for your event.",
      },
    ],
  },
  {
    label: "Event Pages",
    items: [
      {
        q: "What is an event page?",
        a: "Every event on Sera gets a beautiful, branded page that your guests can visit. It includes event details, RSVP functionality, location, schedule, dress code, and more — all designed to look polished and work perfectly on mobile.",
      },
    ],
  },
  {
    label: "Guest Management",
    items: [
      {
        q: "How does RSVP work?",
        a: "Guests receive an invitation with an RSVP link. They can respond, indicate plus-ones, and add notes. As an organizer, you see all responses in real time from your dashboard.",
      },
      {
        q: "Can I manage my guest list?",
        a: "Yes. You can add, remove, and segment guests, track RSVP status, manage walk-ins, and export your guest data at any time.",
      },
    ],
  },
  {
    label: "Drink Tickets & Night-Of",
    items: [
      {
        q: "What are digital drink tickets?",
        a: "Digital drink tickets replace physical tickets. You issue them through Sera, guests receive them on their phones, and bartenders redeem them via QR scan or NFC tap — all tracked in real time.",
      },
      {
        q: "How does check-in work?",
        a: "Each guest gets a unique QR code. Door staff scan it to check them in. Sera also supports NFC tap-in for frictionless entry. Organizers see real-time check-in status from their mobile dashboard.",
      },
      {
        q: "Do bartenders need a special app?",
        a: "No. Bartenders use Sera's mobile web interface to scan or tap drink tickets. No app download required — it works in the browser on any modern device.",
      },
    ],
  },
  {
    label: "Mobile & Access",
    items: [
      {
        q: "Is Sera mobile-friendly?",
        a: "Sera is built mobile-first. Guests browse event pages and RSVP on their phones. Organizers manage check-in, drink tickets, and guest status from mobile. Every view is designed for real-world, on-the-go use.",
      },
      {
        q: "How do I get started?",
        a: "Request access through our website. Once approved, you'll receive an invitation to set up your organizer account and create your first event.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-sera-sand/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="sera-body text-sera-navy text-sm font-medium pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-sera-stone flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="sera-body text-sera-warm-grey text-sm pb-5 pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">FAQ</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              Frequently asked
              <br /><span className="italic">questions</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-xl mx-auto">
              Everything you need to know about Sera and how it works.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-12">
            {faqCategories.map((cat, ci) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ci * 0.05 }}
              >
                <p className="sera-label text-sera-oxblood mb-4">{cat.label}</p>
                <div>
                  {cat.items.map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
