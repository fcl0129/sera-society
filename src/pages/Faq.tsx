import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";

const faqCategories = [
  {
    label: "Getting started",
    items: [
      { q: "What is Sera Society?", a: "Sera is a platform for hosting intentional events, from invitation to entry and service." },
      { q: "Who is it for?", a: "It is designed for organizers, brands, and teams that care about both atmosphere and execution." },
      { q: "How do I join?", a: "Request access and our team will follow up after review." },
    ],
  },
  {
    label: "Guest experience",
    items: [
      { q: "Can I design custom invitations?", a: "Yes. You can shape layout, typography, imagery, and tone to match your event." },
      { q: "Can guests RSVP from their phone?", a: "Yes. Every RSVP flow is mobile-first and easy to complete in moments." },
    ],
  },
  {
    label: "Night operations",
    items: [
      { q: "How does check-in work?", a: "Guests are verified by QR or NFC, with live status for your door team." },
      { q: "How do drink tickets work?", a: "Tickets are issued digitally and redeemed at station level, with real-time tracking." },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#e7d8c4]/20">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="text-[#efe3d3]">{q}</span>
        <ChevronDown className={`h-4 w-4 text-[#d2c5b3] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pb-5 pr-8 text-[0.96rem] leading-[1.7] text-[#d4c8b7]"
          >
            {a}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader title="Questions, answered" description="A clear view of how Sera works before your first event goes live." />
      </SeraContainer>
      <SeraSection>
        <SeraContainer className="space-y-10">
          {faqCategories.map((category) => (
            <section key={category.label} className="space-y-2">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#d9cbbb]/70">{category.label}</p>
              <div>
                {category.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
