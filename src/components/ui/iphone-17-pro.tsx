import { cn } from "@/lib/utils";

interface Iphone17ProProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Iphone17Pro({
  src,
  alt = "iPhone preview",
  width = 200,
  height = 400,
  className,
}: Iphone17ProProps) {
  return (
    <div
      className={cn("relative mx-auto", className)}
      style={{ width, height }}
      aria-label={alt}
    >
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-white/55 via-white/10 to-black/10 blur-2xl" />

      <div className="relative h-full w-full overflow-hidden rounded-[3rem] border border-white/45 bg-[#111827] p-[7px] shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
        <div className="absolute inset-[2px] rounded-[2.7rem] border border-white/10" />

        <div className="absolute left-1/2 top-[14px] z-20 h-7 w-32 -translate-x-1/2 rounded-full border border-white/5 bg-black/85 shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />

        <div className="absolute left-[5px] top-24 h-12 w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[5px] top-40 h-20 w-[3px] rounded-full bg-white/20" />
        <div className="absolute right-[5px] top-32 h-24 w-[3px] rounded-full bg-white/20" />

        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-[#0f172a]">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/16 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/24 to-transparent" />
        </div>
      </div>
    </div>
  );
}
