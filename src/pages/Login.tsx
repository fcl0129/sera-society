import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

type View = "login" | "forgot";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const redirectPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setLoginMessage("Supabase är inte konfigurerat ännu. Lägg till miljövariabler i Lovable.");
      return;
    }
    setIsLoggingIn(true);
    setLoginMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginMessage(error.message);
      setIsLoggingIn(false);
      return;
    }

    setIsLoggingIn(false);
    const role = data?.user?.app_metadata?.role;
    navigate(role === "master" ? "/master/access-requests" : redirectPath, { replace: true });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setForgotMessage("Supabase är inte konfigurerat ännu. Lägg till miljövariabler i Lovable.");
      return;
    }
    setIsSendingReset(true);
    setForgotMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setForgotMessage(error.message);
      setIsSendingReset(false);
      return;
    }

    setForgotSent(true);
    setIsSendingReset(false);
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
            Access your organizer dashboard, manage events, and power your next evening.
          </p>
        </div>
        <p className="text-sera-sand/70 text-xs italic font-serif">Better late than ordinary.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          className="w-full max-w-md bg-sera-navy/45 backdrop-blur-md border border-sera-sand/20 shadow-[0_24px_80px_rgba(0,0,0,0.45)] p-8 md:p-10"
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
                <p className="sera-label text-sera-sand/70 mb-2">Organizer Access</p>
                <h2 className="sera-subheading text-sera-ivory text-2xl">Sign in to Sera</h2>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="sera-label text-sera-sand text-[10px]">Email</Label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-sera-navy/50 border-sera-ink/60 text-sera-ivory placeholder:text-sera-stone/60 rounded-none h-11 font-sans text-sm focus:border-sera-sand"
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
                      className="bg-sera-navy/50 border-sera-ink/60 text-sera-ivory placeholder:text-sera-stone/60 rounded-none h-11 font-sans text-sm pr-10 focus:border-sera-sand"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sera-sand/70 hover:text-sera-ivory transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {loginMessage && <p className="text-xs text-sera-sand">{loginMessage}</p>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-sera-sand/70 hover:text-sera-ivory transition-colors font-sans"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button variant="sera-ivory" size="lg" className="w-full" type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? "Signing in..." : "Continue"}
                </Button>
              </form>
              <p className="mt-8 text-center text-xs text-sera-sand/90">
                Need invite-only access?{" "}
                <Link
                  to="/request-access"
                  className="text-sera-sand hover:text-sera-ivory transition-colors underline underline-offset-4"
                >
                  Request an invitation
                </Link>
              </p>
              <p className="mt-2 text-center text-xs text-sera-sand/90">
                Are you the owner? <span className="text-sera-sand">Use your master account to sign in.</span>
              </p>
            </>
          )}

          {view === "forgot" && !forgotSent && (
            <>
              <button
                onClick={() => setView("login")}
                className="flex items-center gap-2 text-sera-sand/70 hover:text-sera-ivory transition-colors text-xs mb-8"
              >
                <ArrowLeft size={14} />
                <span className="font-sans">Back to login</span>
              </button>
              <div className="mb-8">
                <p className="sera-label text-sera-sand/70 mb-2">Password Reset</p>
                <h2 className="sera-subheading text-sera-ivory text-2xl">Reset your password</h2>
                <p className="sera-body text-sera-sand/80 text-sm mt-3">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              <form onSubmit={handleForgot} className="space-y-5">
                <div className="space-y-2">
                  <Label className="sera-label text-sera-sand text-[10px]">Email</Label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-sera-navy/50 border-sera-ink/60 text-sera-ivory placeholder:text-sera-stone/60 rounded-none h-11 font-sans text-sm focus:border-sera-sand"
                    required
                  />
                </div>
                {forgotMessage && <p className="text-xs text-sera-sand">{forgotMessage}</p>}
                <Button variant="sera-ivory" size="lg" className="w-full" type="submit" disabled={isSendingReset}>
                  {isSendingReset ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          {view === "forgot" && forgotSent && (
            <>
              <button
                onClick={() => {
                  setView("login");
                  setForgotSent(false);
                }}
                className="flex items-center gap-2 text-sera-sand/70 hover:text-sera-ivory transition-colors text-xs mb-8"
              >
                <ArrowLeft size={14} />
                <span className="font-sans">Back to login</span>
              </button>
              <div className="text-center py-8">
                <div className="w-12 h-12 border border-sera-sand/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-sera-ivory text-lg">✓</span>
                </div>
                <h2 className="sera-subheading text-sera-ivory text-xl mb-3">Check your email</h2>
                <p className="sera-body text-sera-sand/80 text-sm">
                  If an account exists for {forgotEmail}, we've sent a password reset link.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
