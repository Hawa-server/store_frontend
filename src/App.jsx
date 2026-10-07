import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./components/Root";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
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
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderPage from "./pages/admin/AdminOrderPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import { ThemeProvider } from "./context/ThemeContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import { CartProvider } from "./context/CartContext";
import { AnnouncerProvider } from "./context/AnnouncerContext";
import { CurrencyProvider } from "./context/CurrencyContext";

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
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "orders/:id", element: <AdminOrderPage /> },
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
