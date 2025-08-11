import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import SecurityMiddleware from "@/components/SecurityMiddleware";
import CartDrawer from '@/components/CartDrawer';
import Checkout from './pages/Checkout';
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import MobileApp from "./pages/MobileApp";
import Gallery from "./pages/Gallery";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import QuoteAdmin from "./pages/QuoteAdmin";
import EmailAdmin from "./pages/EmailAdmin";
import OrderAdmin from "./pages/OrderAdmin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import ProductAdmin from "./pages/ProductAdmin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import EnrollmentAdmin from "./pages/EnrollmentAdmin";
import ChatAdmin from "./pages/ChatAdmin";
import SecureNewsletterVerification from "./components/SecureNewsletterVerification";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import ChatBot from "@/components/ChatBot";
import SecurityMonitor from "@/components/SecurityMonitor";
import ScrollToTop from "@/components/ScrollToTop";
import SecureOrderLookup from "./pages/SecureOrderLookup";
import SecurityDashboard from "./pages/SecurityDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <SecurityMiddleware>
              <TooltipProvider>
              <Toaster />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/quotes" element={<AdminProtectedRoute><QuoteAdmin /></AdminProtectedRoute>} />
                <Route path="/admin/emails" element={<AdminProtectedRoute><EmailAdmin /></AdminProtectedRoute>} />
                <Route path="/admin/orders" element={<AdminProtectedRoute><OrderAdmin /></AdminProtectedRoute>} />
                <Route path="/admin/products" element={<AdminProtectedRoute><ProductAdmin /></AdminProtectedRoute>} />
                <Route path="/admin/enrollments" element={<AdminProtectedRoute><EnrollmentAdmin /></AdminProtectedRoute>} />
                <Route path="/admin/chat" element={<AdminProtectedRoute><ChatAdmin /></AdminProtectedRoute>} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                 <Route path="/verify-newsletter" element={<SecureNewsletterVerification />} />
                 <Route path="/secure-order-lookup" element={<SecureOrderLookup />} />
                 <Route path="/admin/security" element={<AdminProtectedRoute><SecurityDashboard /></AdminProtectedRoute>} />
                 <Route path="/admin" element={<AdminDashboard />} />
                 <Route path="/mobile" element={<MobileApp />} />
                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                 <Route path="*" element={<NotFound />} />
               </Routes>
                  <CartDrawer />
                  <ChatBot />
                  <SecurityMonitor />
               </BrowserRouter>
             </TooltipProvider>
            </SecurityMiddleware>
           </CartProvider>
         </AuthProvider>
       </LanguageProvider>
     </HelmetProvider>
   </QueryClientProvider>
);

export default App;
