import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "host_admin" | "organizer" | "bartender" | "guest";

export type AuthState = {
  loading: boolean;
  session: Session | null;
  role: AppRole | null;
  email: string | null;
  fullName: string | null;
};

const ADMIN_ALLOWLIST = ["admin@serasociety.com"];
const VALID_ROLES: AppRole[] = ["admin", "host_admin", "organizer", "bartender", "guest"];

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

  // Safety net: if no profile row exists (e.g. user predates the
  // handle_new_user trigger or was created via admin invite flow), create one.
  if (!profile && normalizedEmail) {
    const seedRole: AppRole = isAllowlistedAdmin(normalizedEmail) ? "admin" : "guest";
    await (supabase as any)
      .from("profiles")
      .upsert(
        { id: userId, email: normalizedEmail, role: seedRole },
        { onConflict: "id" }
      );
    return seedRole;
  }

  // If allowlisted admin, ensure profile is at admin level
  if (isAllowlistedAdmin(normalizedEmail) && profileRole !== "admin" && profileRole !== "host_admin") {
    await (supabase as any)
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId);
    return "admin";
  }

  if (profileRole && VALID_ROLES.includes(profileRole)) {
    return profileRole;
  }

  return "guest";
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

      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("full_name")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      const resolvedRole = await resolveUserRole(
        currentSession.user.id,
        currentSession.user.email
      );

      if (!active) return;
      setRole(resolvedRole);
      setFullName(profile?.full_name ?? null);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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
  if (role === "admin" || role === "host_admin") return "/admin";
  if (role === "organizer") return "/organizer";
  if (role === "bartender") return "/ops/bartender";
  return "/ops/guest";
}

export function isStaffRole(role: AppRole | null): boolean {
  return role === "admin" || role === "host_admin" || role === "organizer";
}
