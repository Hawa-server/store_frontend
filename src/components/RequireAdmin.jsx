import { Navigate, useLocation } from "react-router-dom";
import AccessDenied from "./AccessDenied";
import { loginPath, useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6" aria-hidden="true">
        <div className="h-10 w-1/3 rounded-full bg-disabled" />
        <div className="h-64 rounded-card bg-disabled" />
      </div>
    );
  }

  if (!user) return <Navigate to={loginPath(`${location.pathname}${location.search}`)} replace />;
  if (!user.isAdmin) {
    return (
      <main className="min-h-dvh bg-bg">
        <AccessDenied />
      </main>
    );
  }
  return children;
}
