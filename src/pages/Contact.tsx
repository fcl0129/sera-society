import { useState } from "react";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inquiryTypes = ["General", "Support", "Partnership", "Private demo"];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState("General");

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader
          title="Let’s connect"
          description="Whether you’re planning your next event or exploring a partnership, we’re here to help."
        />
      </SeraContainer>

      <SeraSection>
        <SeraContainer className="max-w-2xl">
          {!submitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-5 border-t border-[#e6d7c3]/20 pt-6"
            >
              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Name</Label>
                <Input required className="h-11 rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Email</Label>
                <Input required type="email" className="h-11 rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>

              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">How can we help?</Label>
                <div className="flex flex-wrap gap-2">
                  {inquiryTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] ${selectedType === type ? "border-[#f0e1cb]/65 text-[#f0e1cb]" : "border-[#e2d2bc]/30 text-[#d5c7b5]"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#e7d8c3]">Message</Label>
                <Textarea required className="min-h-[130px] rounded-none border-[#e2d2bc]/30 bg-[#0f1725]/35 text-[#f0e4d2]" />
              </div>

              <Button type="submit" className="sera-landing-btn sera-landing-btn--primary h-11 rounded-none px-6 py-0 text-[0.72rem]">Send message</Button>
            </form>
          ) : (
            <div className="border-t border-[#e6d7c3]/20 pt-6 text-[#d7cab8]">Thanks for your note. We’ll reach out shortly.</div>
          )}
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
