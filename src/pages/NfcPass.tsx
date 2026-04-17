import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function NfcPass() {
  const { tag } = useParams<{ tag: string }>();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const decodedTag = useMemo(() => {
    if (!tag) return "";
    try {
      return decodeURIComponent(tag);
    } catch {
      return tag;
    }
  }, [tag]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const hasTag = decodedTag.length > 0;
  const supportsWebNfc = typeof window !== "undefined" && "NDEFReader" in window;

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(`${label} kopierad.`);
    } catch {
      setStatusMessage(`Kunde inte kopiera ${label.toLowerCase()}.`);
    }
  };

  const writeToNfcCard = async () => {
    if (!hasTag || !("NDEFReader" in window)) {
      setStatusMessage("Web NFC stöds inte i den här enheten/browsern.");
      return;
    }

    try {
      // @ts-ignore - Web NFC is not in default TypeScript lib yet
      const ndef = new NDEFReader();
      await ndef.write(decodedTag);
      setStatusMessage("Taggen är skriven till NFC-chip.");
    } catch {
      setStatusMessage("Kunde inte skriva till NFC-chip. Kontrollera NFC-behörighet.");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="sera-label text-sera-stone mb-4">NFC Device Pass</p>
          <h1 className="sera-heading text-sera-ivory text-4xl md:text-5xl mb-4">Use this device as NFC tag</h1>
          <p className="sera-body text-sera-sand text-lg">
            Visa denna sida på mobil/surfplatta och dela länken med dörrpersonalen.
          </p>
        </div>
      </section>

      <section className="py-16 sera-surface-light">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-sera-ivory/60 border border-sera-sand/60 p-6 space-y-4">
            {!hasTag ? (
              <p className="text-sm text-red-700">Ingen NFC-tagg hittades i länken.</p>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wider text-sera-stone mb-2">NFC tag value</p>
                  <p className="font-mono text-sm break-all border border-sera-sand/60 bg-sera-ivory p-3">{decodedTag}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="sera" type="button" onClick={() => void copyValue(decodedTag, "NFC-tag")}>Copy NFC tag</Button>
                  <Button variant="sera-outline" type="button" onClick={() => void copyValue(pageUrl, "Länk")}>Copy link</Button>
                  <Button variant="outline" type="button" onClick={() => void writeToNfcCard()} disabled={!supportsWebNfc}>
                    Write to NFC card
                  </Button>
                </div>

                <p className="text-xs text-sera-warm-grey">
                  Tips: I check-in kan personalen klistra in hela länken eller själva taggen i NFC-fältet.
                </p>
              </>
            )}

            {statusMessage && <p className="text-xs text-green-700">{statusMessage}</p>}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
