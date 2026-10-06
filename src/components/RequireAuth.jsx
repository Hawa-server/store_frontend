import { Navigate, useLocation } from "react-router-dom";
import PageContainer from "./PageContainer";
import { loginPath, useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <PageContainer className="py-16" aria-hidden="true">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-10 w-2/3 rounded-full bg-disabled" />
          <div className="h-40 rounded-card bg-disabled" />
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return <Navigate to={loginPath(`${location.pathname}${location.search}`)} replace />;
  }

  return children;
}
