import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface MasterRouteProps {
  children: ReactNode;
}

export default function MasterRoute({ children }: MasterRouteProps) {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    };

    void getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center sera-gradient-navy px-6">
        <div className="text-center">
          <p className="sera-label text-sera-stone mb-3">Master Access</p>
          <h1 className="sera-subheading text-sera-ivory text-2xl mb-2">Loading admin access</h1>
          <p className="sera-body text-sera-sand text-sm">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = session.user.app_metadata?.role;
  if (role !== "master") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;

  import RsvpPage from "@/pages/Rsvp";
  <Route path="/rsvp/:token" element={<RsvpPage />} />
``
}
