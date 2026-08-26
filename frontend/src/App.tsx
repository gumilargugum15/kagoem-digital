import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import TechNotes from "@/pages/TechNotes";
import TechNoteDetail from "@/pages/TechNoteDetail";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
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

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/tech-notes" element={<TechNotes />} />
      <Route path="/tech-notes/:slug" element={<TechNoteDetail />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
