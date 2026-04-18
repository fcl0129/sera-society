import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "host_admin" | "bartender" | "guest";

export type AuthState = {
  loading: boolean;
  session: Session | null;
  role: AppRole | null;
};

export function useAuthState(): AuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let active = true;

    const load = async (currentSession: Session | null) => {
      if (!active) return;

      setSession(currentSession);

      if (!currentSession?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const fallbackName =
        (currentSession.user.user_metadata?.full_name as string | undefined) ??
        currentSession.user.email?.split("@")[0] ??
        "Sera Member";

      await (supabase as any).from("profiles").upsert({
        id: currentSession.user.id,
        full_name: fallbackName,
      });

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (!active) return;
      setRole((data?.role as AppRole | undefined) ?? "guest");
      setLoading(false);
    };

    (supabase as any).auth.getSession().then(({ data }) => {
      void load(data.session);
    });

    const {
      data: { subscription },
    } = (supabase as any).auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      void load(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(() => ({ loading, session, role }), [loading, role, session]);
}
