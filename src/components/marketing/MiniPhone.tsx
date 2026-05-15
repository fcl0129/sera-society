import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  width?: number;
  tilt?: number;
  style?: CSSProperties;
};

/**
 * Compact, premium phone frame for product demos.
 * Mobile-first: width is capped via CSS so it never overflows.
 */
export default function MiniPhone({ children, width = 260, tilt = 0, style }: Props) {
  const W = width;
  const H = Math.round(width * 2.05);
  return (
    <div
      style={{
        width: W,
        maxWidth: "100%",
        aspectRatio: `${W} / ${H}`,
        borderRadius: W * 0.13,
        padding: Math.max(4, W * 0.035),
        background: "#0a0a0a",
        boxShadow:
          "0 36px 90px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,235,221,0.06)",
        position: "relative",
        flexShrink: 0,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: W * 0.04,
          left: "50%",
          transform: "translateX(-50%)",
          width: W * 0.32,
          height: W * 0.06,
          background: "#000",
          borderRadius: W * 0.04,
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          borderRadius: W * 0.1,
          overflow: "hidden",
          background: "var(--mkt-navy)",
        }}
      >
        {children}
      </div>
    </div>
  );
}