import { motion } from "framer-motion";
import { CalendarDays, Globe, Palette, ScanLine, ShieldCheck, Smartphone, Ticket, Users } from "lucide-react";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";

const features = [
  { icon: CalendarDays, title: "Plan the evening", desc: "Shape your timeline, venue details, and pacing in one calm workspace." },
  { icon: Palette, title: "Design your invitation", desc: "Create invitations and flyers with an editorial look that feels true to your event." },
  { icon: Users, title: "Keep track of your guests", desc: "See responses, plus-ones, and arrivals without losing the human side of hosting." },
  { icon: Globe, title: "Share one event page", desc: "Offer guests a polished home for schedule, location, and everything they need." },
  { icon: Ticket, title: "Offer digital drink tickets", desc: "Deliver tickets directly to guests and keep service moving naturally." },
  { icon: ShieldCheck, title: "Welcome guests with confidence", desc: "Support your door team with fast check-in and clear status at a glance." },
  { icon: ScanLine, title: "Redeem with QR or NFC", desc: "Let staff confirm tickets in seconds while keeping flow uninterrupted." },
  { icon: Smartphone, title: "Run smoothly on mobile", desc: "Every step is designed for real event conditions, right from your phone." },
];

export default function Platform() {
  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader
          title="Everything for the evening, in one place"
          description="From first invitation to final pour, Sera keeps every moment aligned with your brand and pace."
        />
      </SeraContainer>

      <SeraSection spacing="large">
        <SeraContainer>
          <div className="grid gap-10 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="space-y-3 border-t border-[#e7d8c4]/20 pt-5"
              >
                <feature.icon className="h-5 w-5 text-[#e2cbb2]" strokeWidth={1.5} />
                <h2 className="font-display text-[1.7rem] leading-[1] tracking-[-0.02em] text-[#f1e7d9]">{feature.title}</h2>
                <p className="text-[0.98rem] leading-[1.75] text-[#d6cab9]">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
