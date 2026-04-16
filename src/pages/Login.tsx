import React, { useState } from "react";
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

  const redirectPath =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setLoginMessage(
        "Supabase är inte konfigurerat ännu. Lägg till miljövariabler i Lovable."
      );
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
