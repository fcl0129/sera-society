export default function SectionFade({
  from = "rgba(245, 242, 236, 1)", // paper
  to = "rgba(5, 8, 20, 1)",        // navy
}: {
  from?: string;
  to?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="w-full h-24 md:h-32"
      style={{
        background: `linear-gradient(to bottom, ${from}, ${to})`,
      }}
    />
  );
}
