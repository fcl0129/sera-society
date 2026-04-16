import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export default function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventsDetails, setEventsDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase är inte konfigurerat ännu. Lägg till miljövariabler i Lovable.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.from("access_requests").insert({
      name,
      email,
      events_details: eventsDetails || null,
    });

    if (error) {
      setErrorMessage("Kunde inte skicka ansökan just nu. Försök igen.");
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Join Sera Society</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              Request
              <br /><span className="italic">access</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-xl mx-auto">
              Sera is currently available by invitation. Tell us about your events and we'll be in touch.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-lg mx-auto px-6">
          {!submitted ? (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-sera-sand bg-sera-ivory/50 rounded-none h-11 font-sans text-sm focus:border-sera-navy"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-sera-sand bg-sera-ivory/50 rounded-none h-11 font-sans text-sm focus:border-sera-navy"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Tell us about your events</Label>
                <Textarea
                  value={eventsDetails}
                  onChange={(e) => setEventsDetails(e.target.value)}
                  className="border-sera-sand bg-sera-ivory/50 rounded-none font-sans text-sm focus:border-sera-navy min-h-[120px]"
                />
              </div>
              {errorMessage && <p className="text-xs text-red-700">{errorMessage}</p>}
              <Button variant="sera" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </motion.form>
          ) : (
            <motion.div className="text-center py-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-14 h-14 border border-sera-navy/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-sera-navy text-xl">✓</span>
              </div>
              <h2 className="sera-subheading text-sera-navy text-2xl mb-3">Request received</h2>
              <p className="sera-body text-sera-warm-grey">We'll review your request and be in touch soon.</p>
              <Button variant="sera-outline" size="lg" className="mt-8" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}