import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import PageHero from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export default function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOrg = organization.trim();
    const cleanReason = reason.trim();

    if (!cleanName || !cleanEmail) {
      setErrorMsg("Please provide your name and email.");
      setIsSubmitting(false);
      return;
    }

    // 1. Persist the request to the database (RLS allows anon insert)
    const { error: insertError } = await (supabase as any)
      .from("access_requests")
      .insert({
        name: cleanName,
        email: cleanEmail,
        organization: cleanOrg || null,
        reason: cleanReason || null,
      });

    if (insertError) {
      setErrorMsg(`We couldn't save your request: ${insertError.message}`);
      setIsSubmitting(false);
      return;
    }

    // 2. Best-effort admin notification email (non-blocking failure)
    try {
      await supabase.functions.invoke("send-sera-email", {
        body: {
          template: "invitation",
          to: "admin@serasociety.com",
          data: {
            event_title: `New access request — ${cleanName}`,
            event_date: new Date().toLocaleString(),
            venue: `${cleanEmail}${cleanOrg ? ` · ${cleanOrg}` : ""}${
              cleanReason ? ` — ${cleanReason}` : ""
            }`,
            app_url: window.location.origin,
          },
        },
      });
    } catch {
      // best-effort; the request is already saved
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageHero
        eyebrow="Join Sera Society"
        title={
          <>
            Request
            <br />
            <span className="italic">access</span>
          </>
        }
        description="Sera is currently available by invitation. Tell us about your events and we&rsquo;ll be in touch."
      />

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
                <Label className="sera-label text-sera-navy text-[10px]">Company / Organization (optional)</Label>
                <Input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="border-sera-sand bg-sera-ivory/50 rounded-none h-11 font-sans text-sm focus:border-sera-navy"
                />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Tell us about your events</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="border-sera-sand bg-sera-ivory/50 rounded-none font-sans text-sm focus:border-sera-navy min-h-[120px]"
                />
              </div>
              {errorMsg && <p className="text-xs text-sera-oxblood">{errorMsg}</p>}
              <Button variant="sera" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit request"}
              </Button>
            </motion.form>
          ) : (
            <motion.div className="text-center py-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-14 h-14 border border-sera-navy/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-sera-navy text-xl">✓</span>
              </div>
              <h2 className="sera-subheading text-sera-navy text-2xl mb-3">Request received</h2>
              <p className="sera-body text-sera-warm-grey">
                We&rsquo;ll review your request and email you when access is granted.
              </p>
              <Button variant="sera-outline" size="lg" className="mt-8" asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
