import { Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";

export default function Root() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <Outlet />
        <ScrollRestoration />
      </WishlistProvider>
    </AuthProvider>
  );
}
