import { Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <ScrollRestoration />
    </AuthProvider>
  );
}
