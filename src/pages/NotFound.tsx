import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center sera-gradient-navy px-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--sera-ivory)) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-xl text-center border border-sera-sand/20 bg-sera-navy/45 backdrop-blur-md p-10 md:p-14 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="sera-label text-sera-sand/70 mb-3">Sera Society</p>

        <h1 className="mb-4 font-serif font-light text-sera-ivory text-6xl md:text-7xl">
          404
        </h1>

        <p className="sera-subheading text-sera-ivory text-2xl mb-4">
          This page slipped off the guest list
        </p>

        <p className="sera-body text-sera-sand/85 text-sm mb-8">
          The link may be outdated, or the page might have moved.
        </p>

        <Link
          to="/"
          className="inline-block text-sera-sand underline underline-offset-4 hover:text-sera-ivory transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;