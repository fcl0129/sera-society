import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

type View = "login" | "forgot" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setSignupMessage("Supabase är inte konfigurerat ännu. Lägg till miljövariabler i Lovable.");
      return;
    }
    setIsCreatingAccount(true);
    setSignupMessage(null);

    if (signupPassword.length < 8) {
      setSignupMessage("Lösenordet måste vara minst 8 tecken.");
      setIsCreatingAccount(false);
      return;
    }

    if (signupPassword !== confirmPassword) {
      setSignupMessage("Lösenorden matchar inte.");
      setIsCreatingAccount(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setSignupMessage(error.message);
      setIsCreatingAccount(false);
      return;
    }

    setSignupMessage("Konto skapat! Bekräfta din e-post för att aktivera kontot.");
    setConfirmPassword("");
    setSignupPassword("");
    setIsCreatingAccount(false);
  };

  return (
    <div className="min-h-screen fl