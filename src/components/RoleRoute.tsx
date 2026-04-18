import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AppRole } from "@/lib/auth";
import { useAuthState } from "@/lib/auth";

interface RoleRouteProps {
  children: ReactNode;
  allow: AppRole[];
}

export default function RoleRoute({ children, allow }: RoleRouteProps) {
  const { loading, session, role } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center sera-gradient-navy px-6">
        <p className="sera-body text-sera-sand text-sm">Loading your access profile...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allow.includes(role)) {
    const fallback = role === "host_admin" ? "/ops/host" : role === "bartender" ? "/ops/bartender" : "/ops/guest";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
