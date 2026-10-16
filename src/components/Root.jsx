import { Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";
import { AnnouncementProvider } from "../context/AnnouncementContext";

export default function Root() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <AnnouncementProvider>
          <Outlet />
          <ScrollRestoration />
        </AnnouncementProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
