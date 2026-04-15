import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">About</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              A new standard
              <br /><span className="italic">for modern events</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              Sera Society is a premium event platform that brings together beautiful design and practical operations — so organizers can focus on the experience.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="sera-label text-sera-oxblood mb-3">What Sera Does</p>
              <h2 className="sera-subheading text-sera-navy text-2xl md:text-3xl mb-4">Design meets operations</h2>
              <p className="sera-body text-sera-warm-grey">
                Most event tools force you to choose between aesthetics and functionality. Sera brings both together. 
                Create stunning digital invitations and guest-facing event pages. Then manage your guest list, RSVPs, 
                check-in, drink tickets, and event-night operations — all from a single platform built mobile-first.
              </p>
            </div>

            <div className="h-px bg-sera-sand/50" />

            <div>
              <p className="sera-label text-sera-oxblood mb-3">Who It's For</p>
              <h2 className="sera-subheading text-sera-navy text-2xl md:text-3xl mb-4">Organizers who care about <span className="italic">every</span> detail</h2>
              <p className="sera-body text-sera-warm-grey mb-4">
                Sera is built for people who host intentionally — from intimate dinners and private gatherings to 
                headline parties and cultural events. Whether you're managing 30 guests or 3,000, the platform 
                scales to match your ambition without sacrificing the premium experience.
              </p>
              <p className="sera-body text-sera-warm-grey">
                Event producers, creative directors, brand hosts, cultural curators, and anyone 
                who believes an event should feel as polished in its operations as it looks on the invitation.
              </p>
            </div>

            <div className="h-px bg-sera-sand/50" />

            <div>
              <p className="sera-label text-sera-oxblood mb-3">The Full Stack</p>
              <h2 className="sera-subheading text-sera-navy text-2xl md:text-3xl mb-4">From first invitation to last call</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {[
                  "Invitation & flyer design",
                  "Guest-facing event pages",
                  "Guest list & RSVP management",
                  "Digital drink tickets",
                  "QR & NFC check-in",
                  "Drink ticket redemption",
                  "Organizer dashboard",
                  "Staff roles & permissions",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 border border-sera-sand/40 bg-sera-ivory/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-sera-oxblood flex-shrink-0" />
                    <span className="sera-body text-sera-navy text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-sera-sand/50" />

            <div>
              <p className="sera-label text-sera-oxblood mb-3">Our Approach</p>
              <h2 className="sera-subheading text-sera-navy text-2xl md:text-3xl mb-4">Premium by default</h2>
              <p className="sera-body text-sera-warm-grey">
                We believe event technology should match the standards of the events it powers. That means editorial-quality 
                design, mobile-first usability, and operational tools that work under pressure — on the night, in the venue, 
                with hundreds of guests walking through the door. Sera is built for the real conditions of event night, 
                not just the planning phase.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="sera" size="lg" asChild>
              <Link to="/request-access">Request Access</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
