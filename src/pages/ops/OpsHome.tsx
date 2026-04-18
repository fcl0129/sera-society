import { Navigate } from "react-router-dom";
import { landingPathForRole, useAuthState } from "@/lib/auth";

export default function OpsHome() {
  const { loading, session, role } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center sera-gradient-navy px-6">
        <p className="sera-body text-sera-sand text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={landingPathForRole(role)} replace />;
}
