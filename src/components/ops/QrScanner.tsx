import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onDetected: (value: string) => void;
  paused?: boolean;
};

export default function QrScanner({ onDetected, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    let detector: BarcodeDetector | null = null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    async function start() {
      if (!("BarcodeDetector" in window)) {
        setSupported(false);
        setError("Live camera QR scanning is not available in this browser. Use manual ticket code entry.");
        return;
      }

      try {
        detector = new BarcodeDetector({ formats: ["qr_code"] });
        setSupported(true);
      } catch {
        setSupported(false);
        setError("QR scanner failed to initialize.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const detectFrame = async () => {
          if (!active || paused || !video || !detector || !ctx) {
            rafRef.current = requestAnimationFrame(detectFrame);
            return;
          }

          if (video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
              const barcodes = await detector.detect(canvas);
              const first = barcodes.find((code) => !!code.rawValue)?.rawValue;
              if (first) {
                onDetected(first.trim());
                return;
              }
            } catch {
              // keep scanning
            }
          }

          rafRef.current = requestAnimationFrame(detectFrame);
        };

        rafRef.current = requestAnimationFrame(detectFrame);
      } catch {
        setError("Camera permission was denied or camera is unavailable.");
      }
    }

    void start();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [onDetected, paused]);

  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-sera-sand/40 bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
      </div>
      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
      {supported === false ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => window.location.reload()}>
          Retry scanner
        </Button>
      ) : null}
    </div>
  );
}
