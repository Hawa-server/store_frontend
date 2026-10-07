import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./components/Root";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductPage from "./pages/ProductPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutCompletePage from "./pages/CheckoutCompletePage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import { ThemeProvider } from "./context/ThemeContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import { CartProvider } from "./context/CartContext";
import { AnnouncerProvider } from "./context/AnnouncerContext";
import { CurrencyProvider } from "./context/CurrencyContext";

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminOrderPage = lazy(() => import("./pages/admin/AdminOrderPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminProductFormPage = lazy(() => import("./pages/admin/AdminProductFormPage"));

function AdminLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-admin-bg text-text-muted" role="status">
      Loading admin…
    </div>
  );
}

const loggedIn = (element) => <RequireAuth>{element}</RequireAuth>;

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/products", element: <ProductListPage /> },
          { path: "/category/:slug", element: <ProductListPage /> },
          { path: "/product/:id", element: <ProductPage /> },
          { path: "/cart", element: <CartPage /> },
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/checkout/complete", element: <CheckoutCompletePage /> },
          { path: "/order/confirmation/:token", element: <OrderConfirmationPage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
          { path: "/account", element: loggedIn(<AccountPage />) },
          { path: "/orders", element: loggedIn(<OrdersPage />) },
          { path: "/orders/:id", element: loggedIn(<OrderDetailPage />) },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      {
        path: "/admin",
        element: (
          <Suspense fallback={<AdminLoading />}>
            <AdminLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "orders/:id", element: <AdminOrderPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "products/new", element: <AdminProductFormPage key="new" /> },
          { path: "products/:id", element: <AdminProductFormPage key="edit" /> },
          { path: "reviews", element: <AdminReviewsPage /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <AnnouncerProvider>
        <CurrencyProvider>
          <CategoriesProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </CategoriesProvider>
        </CurrencyProvider>
      </AnnouncerProvider>
    </ThemeProvider>
  );
}
