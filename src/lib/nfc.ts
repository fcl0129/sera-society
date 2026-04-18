// Capability-aware NFC redemption layer.
//
// Web NFC (NDEFReader) is supported only on Chrome/Android. We feature-detect
// rather than promising universal phone-to-phone NFC support. When unavailable,
// the UI gracefully falls back to QR + the bartender's manual flow.
//
// Methods:
//   - nfc_tag         : guest tapped a fixed sticker; tag broadcasts the bar's payload.
//                       The redemption itself uses the guest's own ticket token.
//   - qr              : guest scanned (or bartender scanned) a QR rendering the token.
//   - manual          : bartender typed the token.
//   - device_emulation: capability-gated; not enabled in this web build.

export type RedemptionMethod = "nfc_tag" | "qr" | "manual" | "device_emulation";

export type NfcCapability = {
  supported: boolean;
  reason: "ok" | "no_navigator" | "no_ndef" | "insecure_context" | "unsupported_browser";
};

export function detectNfcCapability(): NfcCapability {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { supported: false, reason: "no_navigator" };
  }
  if (!window.isSecureContext) {
    return { supported: false, reason: "insecure_context" };
  }
  // @ts-expect-error - Web NFC types aren't bundled in lib.dom
  if (typeof window.NDEFReader === "undefined") {
    return { supported: false, reason: "no_ndef" };
  }
  return { supported: true, reason: "ok" };
}

// Device-as-tag (HCE / iOS card emulation) is not available in any web browser today.
// We expose the capability check so future native wrappers can light it up.
export function detectDeviceEmulationCapability(): NfcCapability {
  return { supported: false, reason: "unsupported_browser" };
}

export type NfcReadEvent = { serialNumber?: string; payload?: string };

export async function startNfcRead(
  onTap: (event: NfcReadEvent) => void,
  onError: (err: Error) => void
): Promise<() => void> {
  const cap = detectNfcCapability();
  if (!cap.supported) {
    onError(new Error("NFC not available on this device"));
    return () => undefined;
  }

  try {
    // @ts-expect-error - Web NFC
    const reader = new window.NDEFReader();
    const ctrl = new AbortController();
    await reader.scan({ signal: ctrl.signal });

    reader.addEventListener("reading", (event: any) => {
      let payload: string | undefined;
      try {
        for (const record of event.message?.records ?? []) {
          if (record.recordType === "url" || record.recordType === "text") {
            payload = new TextDecoder().decode(record.data);
            break;
          }
        }
      } catch {
        // ignore decoding errors
      }
      onTap({ serialNumber: event.serialNumber, payload });
    });

    reader.addEventListener("readingerror", () => {
      onError(new Error("NFC read failed. Try again."));
    });

    return () => ctrl.abort();
  } catch (err) {
    onError(err instanceof Error ? err : new Error("NFC error"));
    return () => undefined;
  }
}
