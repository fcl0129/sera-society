import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { SeraContainer } from "@/components/sera/container";
import { SeraLayout } from "@/components/sera/layout";
import { SeraPageHeader } from "@/components/sera/page-header";
import { SeraSection } from "@/components/sera/section";
import { Button } from "@/components/ui/button";

export default function NfcPass() {
  const { tag } = useParams<{ tag: string }>();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const decodedTag = useMemo(() => {
    if (!tag) return "";
    try { return decodeURIComponent(tag); } catch { return tag; }
  }, [tag]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const hasTag = decodedTag.length > 0;
  const supportsWebNfc = typeof window !== "undefined" && "NDEFReader" in window;

  const copyValue = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setStatusMessage(`${label} copied.`); }
    catch { setStatusMessage(`Unable to copy ${label.toLowerCase()}.`); }
  };

  const writeToNfcCard = async () => {
    if (!hasTag || !("NDEFReader" in window)) return setStatusMessage("Web NFC is not available on this device.");
    try {
      // @ts-ignore Web NFC support
      const ndef = new NDEFReader();
      await ndef.write(decodedTag);
      setStatusMessage("Tag written to NFC card.");
    } catch {
      setStatusMessage("Could not write to the NFC card.");
    }
  };

  return (
    <SeraLayout>
      <SeraContainer>
        <SeraPageHeader title="NFC device pass" description="Use this page as a fallback NFC endpoint for your team." />
      </SeraContainer>
      <SeraSection>
        <SeraContainer className="max-w-3xl">
          <div className="space-y-4 border-t border-[#e7d8c4]/20 pt-6 text-[#d7cab8]">
            {!hasTag ? <p>No NFC tag value was found in this link.</p> : (
              <>
                <p className="break-all border border-[#e3d4be]/25 bg-[#0f1725]/35 p-3 font-mono text-xs">{decodedTag}</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="sera" onClick={() => void copyValue(decodedTag, "NFC tag")}>Copy NFC tag</Button>
                  <Button variant="sera-outline" onClick={() => void copyValue(pageUrl, "Link")}>Copy link</Button>
                  <Button variant="outline" onClick={() => void writeToNfcCard()} disabled={!supportsWebNfc}>Write to NFC card</Button>
                </div>
              </>
            )}
            {statusMessage ? <p className="text-sm">{statusMessage}</p> : null}
          </div>
        </SeraContainer>
      </SeraSection>
    </SeraLayout>
  );
}
