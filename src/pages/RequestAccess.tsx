import { useState } from "react";
import { Link } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";
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
      setErrorMsg("Please share your name and email.");
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("access_requests").insert({
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

    try {
      await supabase.functions.invoke("send-sera-email", {
        body: {
          template: "invitation",
          to: "admin@serasociety.com",
          data: {
            event_title: `New access request — ${cleanName}`,
            event_date: new Date().toLocaleString(),
            venue: `${cleanEmail}${cleanOrg ? ` · ${cleanOrg}` : ""}${cleanReason ? ` — ${cleanReason}` : ""}`,
            app_url: window.location.origin,
          },
        },
      });
    } catch {
      // best effort
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader
          title="Request access"
          description="Tell us a little about your events and we’ll follow up with the next step."
        />
      </SeraContainer>

      <SeraSection>
        <SeraContainer className="max-w-2xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5 border-t border-[#e6d7c3]/20 pt-6">
              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Organization (optional)</Label>
                <Input value={organization} onChange={(e) => setOrganization(e.target.value)} className="h-11 rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Tell us what you host (optional)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[130px] rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>
              {errorMsg ? <p className="text-sm text-[#f0c7be]">{errorMsg}</p> : null}
              <Button disabled={isSubmitting} className="sera-landing-btn sera-landing-btn--primary h-11 rounded-none px-6 py-0 text-[0.72rem]">{isSubmitting ? "Sending..." : "Send request"}</Button>
            </form>
          ) : (
            <div className="space-y-4 border-t border-[#e6d7c3]/20 pt-6 text-[#d7cab8]">
              <p>Thank you — your request is in. We’ll reach out soon.</p>
              <Link to="/" className="text-[#f0e4d3] underline underline-offset-4">Return to home</Link>
            </div>
          )}
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
