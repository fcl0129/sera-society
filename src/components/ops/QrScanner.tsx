import { useCallback, useEffect, useRef, useState } from "react";
import QrScannerLib from "qr-scanner";
import { Button } from "@/components/ui/button";

type Props = {
  onDetected: (value: string) => void;
  paused?: boolean;
};

type ScannerState =
  | "idle"
  | "initializing"
  | "no-camera"
  | "permission-denied"
  | "insecure-context"
  | "unsupported"
  | "error"
  | "scanning";

export default function QrScanner({ onDetected, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScannerLib | null>(null);
  const lastValueRef = useRef<{ value: string; at: number } | null>(null);
  const onDetectedRef = useRef(onDetected);
  const [state, setState] = useState<ScannerState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const stop = useCallback(() => {
    try {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setState("insecure-context");
      setError("Camera requires a secure connection (HTTPS). Use manual entry below.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      setError("This browser does not support camera access. Use manual entry.");
      return;
    }

    setState("initializing");

    try {
      const hasCamera = await QrScannerLib.hasCamera();
      if (!hasCamera) {
        setState("no-camera");
        setError("No camera detected on this device.");
        return;
      }
    } catch {
      // Proceed anyway; some browsers reject hasCamera without permission first
    }

    const video = videoRef.current;
    if (!video) return;

    try {
      const scanner = new QrScannerLib(
        video,
        (result) => {
          const value = result?.data?.trim();
          if (!value) return;
          const now = Date.now();
          const last = lastValueRef.current;
          if (last && last.value === value && now - last.at < 2500) return;
          lastValueRef.current = { value, at: now };
          onDetectedRef.current(value);
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: false,
          highlightCodeOutline: false,
          maxScansPerSecond: 8,
        },
      );
      scannerRef.current = scanner;
      await scanner.start();
      setState("scanning");
      setActive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const lowered = msg.toLowerCase();
      if (lowered.includes("permission") || lowered.includes("denied") || lowered.includes("notallowed")) {
        setState("permission-denied");
        setError("Camera permission was denied. Enable camera access in browser settings, then tap Restart camera.");
      } else if (lowered.includes("notfound") || lowered.includes("no camera")) {
        setState("no-camera");
        setError("No camera found.");
      } else {
        setState("error");
        setError(msg || "Failed to start camera.");
      }
      stop();
    }
  }, [stop]);

  // Pause / resume based on prop while active
  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner || !active) return;
    if (paused) {
      try { scanner.stop(); } catch { /* ignore */ }
    } else {
      void scanner.start().catch(() => { /* ignore restart errors */ });
    }
  }, [paused, active]);

  // Reset duplicate-scan lock when paused changes
  useEffect(() => {
    if (!paused) lastValueRef.current = null;
  }, [paused]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  const showVideo = state === "scanning" || state === "initializing";

  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-sera-line/40 bg-black relative">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          style={{ display: showVideo ? "block" : "none" }}
        />
        {!showVideo && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-xs text-sera-ivory/80">
              {state === "idle" && "Tap Start camera to scan a guest QR pass."}
              {state === "permission-denied" && "Camera blocked. Enable access in browser settings."}
              {state === "no-camera" && "No camera available on this device."}
              {state === "insecure-context" && "Camera requires HTTPS."}
              {state === "unsupported" && "Camera not supported in this browser."}
              {state === "error" && "Camera failed to start."}
            </p>
          </div>
        )}
        {state === "initializing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-xs text-sera-ivory/90">Starting camera…</p>
          </div>
        )}
      </div>

      {error ? <p className="text-xs text-amber-700">{error}</p> : null}

      <div className="flex gap-2">
        {!active ? (
          <Button type="button" variant="outline" className="flex-1" onClick={() => void start()}>
            {state === "idle" ? "Start camera" : "Restart camera"}
          </Button>
        ) : (
          <Button type="button" variant="outline" className="flex-1" onClick={stop}>
            Stop camera
          </Button>
        )}
      </div>
    </div>
  );
}
