import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { landingPathForRole, resolveUserRole } from "@/lib/auth";

type View = "login" | "magic" | "magic-sent";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingMagic, setIsSendingMagic] = useState(false);

  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [magicMessage, setMagicMessage] = useState<string | null>(null);

  const fromPath = (location.state as { from?: string } | null)?.from ?? null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setLoginMessage("Sign-in is not configured yet.");
      return;
    }
    setIsLoggingIn(true);
    setLoginMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginMessage(error.message);
      setIsLoggingIn(false);
      return;
    }

    // Read role from profiles to land in the right place
    const role = await resolveUserRole(data.user?.id, data.user?.email);

    setIsLoggingIn(false);
    navigate(fromPath ?? landingPathForRole(role), { replace: true });
  };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setMagicMessage("Sign-in is not configured yet.");
      return;
    }
    setIsSendingMagic(true);
    setMagicMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/ops`,
      },
    });

    if (error) {
      setMagicMessage(error.message);
      setIsSendingMagic(false);
      return;
    }

    setView("magic-sent");
    setIsSendingMagic(false);
  };

  return (
    <div className="min-h-screen flex sera-gradient-navy relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sera-ivory)) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-light text-sera-ivory">Sera Society</span>
        </Link>
        <div>
          <h1 className="sera-heading text-sera-ivory text-5xl xl:text-6xl mb-6">
            Welcome
            <br />
            <span className="italic">back</span>
          </h1>
          <p className="sera-body text-sera-sand text-lg max-w-sm">
            Access your dashboard, manage your evening, and power your next service.
          </p>
        </div>
        <p className="text-sera-sand/70 text-xs italic font-serif">Better late than ordinary.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          className="w-full max-w-md bg-gradient-to-b from-sera-navy/70 to-sera-deep-navy/50 backdrop-blur-md border border-sera-sand/25 shadow-[0_24px_80px_rgba(0,0,0,0.45)] p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <span className="font-serif text-lg font-light text-sera-ivory">Sera Society</span>
          </Link>

          {view === "login" && (
            <>
              <div className="mb-8">
                <p className="sera-label text-sera-sand/70 mb-2">Sign in</p>
                <h2 className="sera-subheading text-sera-ivory text-2xl">Welcome to Sera</h2>
                <div className="mt-4 h-px w-16 bg-sera-sand/30" />
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="sera-label text-sera-sand text-[10px]">Email</Label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-sera-navy/55 border-sera-sand/25 text-sera-ivory placeholder:text-sera-sand/45 rounded-none h-11 font-sans text-sm focus:border-sera-sand"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="sera-label text-sera-sand text-[10px]">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-sera-navy/55 border-sera-sand/25 text-sera-ivory placeholder:text-sera-sand/45 rounded-none h-11 font-sans text-sm pr-10 focus:border-sera-sand"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sera-sand/70 hover:text-sera-ivory transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {loginMessage && <p className="text-xs text-sera-sand">{loginMessage}</p>}
                <Button variant="sera-ivory" size="lg" className="w-full" type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? "Signing in…" : "Continue"}
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-sera-sand/20" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-sera-sand/60">or</span>
                <div className="h-px flex-1 bg-sera-sand/20" />
              </div>

              <button
                type="button"
                onClick={() => setView("magic")}
                className="mt-6 w-full text-center text-sera-sand hover:text-sera-ivory text-sm transition-colors underline underline-offset-4"
              >
                Email me a magic link
              </button>

              <p className="mt-8 text-center text-xs text-sera-sand/90">
                No account?{" "}
                <Link
                  to="/request-access"
                  className="text-sera-sand hover:text-sera-ivory transition-colors underline underline-offset-4"
                >
                  Request an invitation
                </Link>
              </p>
            </>
          )}

          {view === "magic" && (
            <>
              <button
                type="button"
                onClick={() => setView("login")}
                className="flex items-center gap-2 text-sera-sand/70 hover:text-sera-ivory transition-colors text-xs mb-8"
              >
                <ArrowLeft size={14} />
                <span className="font-sans">Back</span>
              </button>
              <div className="mb-8">
                <p className="sera-label text-sera-sand/70 mb-2">Magic link</p>
                <h2 className="sera-subheading text-sera-ivory text-2xl">Sign in by email</h2>
                <div className="mt-4 h-px w-16 bg-sera-sand/30" />
                <p className="sera-body text-sera-sand/80 text-sm mt-3">
                  We&apos;ll send a one-tap sign-in link to your inbox.
                </p>
              </div>
              <form onSubmit={handleMagic} className="space-y-5">
                <div className="space-y-2">
                  <Label className="sera-label text-sera-sand text-[10px]">Email</Label>
                  <Input
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-sera-navy/55 border-sera-sand/25 text-sera-ivory placeholder:text-sera-sand/45 rounded-none h-11 font-sans text-sm focus:border-sera-sand"
                    required
                  />
                </div>
                {magicMessage && <p className="text-xs text-sera-sand">{magicMessage}</p>}
                <Button variant="sera-ivory" size="lg" className="w-full" type="submit" disabled={isSendingMagic}>
                  {isSendingMagic ? "Sending…" : "Send magic link"}
                </Button>
              </form>
            </>
          )}

          {view === "magic-sent" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border border-sera-sand/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-sera-ivory text-lg">✓</span>
              </div>
              <h2 className="sera-subheading text-sera-ivory text-xl mb-3">Check your email</h2>
              <p className="sera-body text-sera-sand/80 text-sm">
                We sent a sign-in link to {magicEmail}. Tap it to enter Sera.
              </p>
              <button
                type="button"
                onClick={() => setView("login")}
                className="mt-6 text-xs text-sera-sand/70 hover:text-sera-ivory underline underline-offset-4"
              >
                Use password instead
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
