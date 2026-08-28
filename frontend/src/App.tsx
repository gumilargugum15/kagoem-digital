import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import TechNotes from "@/pages/TechNotes";
import TechNoteDetail from "@/pages/TechNoteDetail";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import Account from "@/pages/Account";
import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminServices from "@/pages/admin/Services";
import AdminPortfolio from "@/pages/admin/Portfolio";
import AdminTechNotes from "@/pages/admin/TechNotes";
import AdminProducts from "@/pages/admin/Products";
import AdminProductPlans from "@/pages/admin/ProductPlans";
import AdminFaq from "@/pages/admin/Faq";
import AdminMessages from "@/pages/admin/Messages";
import AdminSettings from "@/pages/admin/Settings";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/tech-notes" element={<TechNotes />} />
      <Route path="/tech-notes/:slug" element={<TechNoteDetail />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderNumber"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/email-verified" element={<VerifyEmail />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/services" element={<AdminServices />} />
      <Route path="/admin/portfolio" element={<AdminPortfolio />} />
      <Route path="/admin/tech-notes" element={<AdminTechNotes />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/products/:id/plans" element={<AdminProductPlans />} />
      <Route path="/admin/faq" element={<AdminFaq />} />
      <Route path="/admin/messages" element={<AdminMessages />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/orders/:orderNumber" element={<AdminOrderDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
