import type { CSSProperties } from "react";

type Tone = "navy" | "cream";

const TONE: Record<Tone, string> = {
  navy: "#071426",
  cream: "#F4EBDD",
};

type Props = {
  from: Tone;
  to: Tone;
  height?: number;
  ornament?: boolean;
};

/**
 * Smooth editorial bridge between two marketing tones (navy / cream).
 * Renders a vertical gradient band with an optional centered brass hairline
 * so the cream/navy alternation feels intentional instead of jarring.
 */
export default function SectionTransition({
  from,
  to,
  height = 96,
  ornament = true,
}: Props) {
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: "100%",
        height,
        background: `linear-gradient(180deg, ${TONE[from]} 0%, ${TONE[to]} 100%)`,
      }}
    >
      {ornament && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 56,
            height: 1,
            background: "var(--mkt-brass-30)",
          } as CSSProperties}
        />
      )}
    </div>
  );
}
