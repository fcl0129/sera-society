import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { landingPathForRole, useAuthState, type AppRole } from "@/lib/auth";

interface RoleRouteProps {
  children: ReactNode;
  allow: AppRole[];
}

export default function RoleRoute({ children, allow }: RoleRouteProps) {
  const { loading, session, role } = useAuthState();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center sera-gradient-navy px-6">
        <p className="sera-body text-sera-sand text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to={landingPathForRole(role)} replace />;
  }

  return <>{children}</>;
}
