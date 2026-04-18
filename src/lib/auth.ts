import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "host_admin" | "bartender" | "guest";

export type AuthState = {
  loading: boolean;
  session: Session | null;
  role: AppRole | null;
  email: string | null;
  fullName: string | null;
};

const ADMIN_ALLOWLIST = ["admin@serasociety.com"];

const isAllowlistedAdmin = (email: string | null | undefined) =>
  !!email && ADMIN_ALLOWLIST.includes(email.toLowerCase());

export async function resolveUserRole(
  userId: string | null | undefined,
  email: string | null | undefined
): Promise<AppRole> {
  if (!userId) return "guest";

  const normalizedEmail = email?.trim().toLowerCase() ?? null;
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const profileRole = profile?.role as AppRole | undefined;
  if (profileRole === "host_admin" || profileRole === "bartender" || profileRole === "guest") {
    return profileRole;
  }

  if (!isAllowlistedAdmin(normalizedEmail)) {
    return "guest";
  }

  await (supabase as any).from("profiles").upsert(
    {
      id: userId,
      email: normalizedEmail,
      role: "host_admin",
    },
    { onConflict: "id" }
  );

  return "host_admin";
}

export function useAuthState(): AuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async (currentSession: Session | null) => {
      if (!active) return;
      setSession(currentSession);

      if (!currentSession?.user) {
        setRole(null);
        setFullName(null);
        setLoading(false);
        return;
      }

      // Fetch role from profiles table (created by trigger on signup)
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (!active) return;

      const resolvedRole = await resolveUserRole(currentSession.user.id, currentSession.user.email);

      setRole(resolvedRole);
      setFullName(profile?.full_name ?? null);
      setLoading(false);
    };

    // Set up listener BEFORE getSession to avoid missing initial event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer Supabase calls to avoid deadlock inside the callback
      setTimeout(() => {
        void loadProfile(nextSession);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      void loadProfile(data.session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      loading,
      session,
      role,
      email: session?.user.email ?? null,
      fullName,
    }),
    [loading, session, role, fullName]
  );
}

export function landingPathForRole(role: AppRole | null): string {
  if (role === "host_admin") return "/ops/host";
  if (role === "bartender") return "/ops/bartender";
  return "/ops/guest";
}
