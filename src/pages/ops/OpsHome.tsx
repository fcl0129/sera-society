import { Navigate } from "react-router-dom";
import { useAuthState } from "@/lib/auth";

export default function OpsHome() {
  const { loading, session, role } = useAuthState();

  if (loading) return <div className="min-h-screen sera-gradient-navy" />;
  if (!session) return <Navigate to="/login" replace />;
  if (role === "host_admin") return <Navigate to="/ops/host" replace />;
  if (role === "bartender") return <Navigate to="/ops/bartender" replace />;
  return <Navigate to="/ops/guest" replace />;
}
