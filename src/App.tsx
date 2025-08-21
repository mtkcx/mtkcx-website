
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SEOProvider } from "./contexts/SEOContext";
import LanguagePreferenceWrapper from "./components/LanguagePreferenceWrapper";
import ScrollToTop from "./components/ScrollToTop";
import SecurityMiddleware from "./components/SecurityMiddleware";
import SecurityMonitor from "./components/SecurityMonitor";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Gallery from "./pages/Gallery";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import OrderAdmin from "./pages/OrderAdmin";
import QuoteAdmin from "./pages/QuoteAdmin";
import ProductAdmin from "./pages/ProductAdmin";
import EnrollmentAdmin from "./pages/EnrollmentAdmin";
import EmailAdmin from "./pages/EmailAdmin";
import ChatAdmin from "./pages/ChatAdmin";
import SecurityDashboard from "./pages/SecurityDashboard";
import SecureOrderLookup from "./pages/SecureOrderLookup";
import VerifyNewsletter from "./pages/VerifyNewsletter";
import MobileApp from "./pages/MobileApp";
import MobileAdminDashboard from "./pages/MobileAdminDashboard";
import NotFound from "./pages/NotFound";

// Legal pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SEOProvider>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <SecurityMonitor>
                  <LanguagePreferenceWrapper>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <SecurityMiddleware>
                        <ScrollToTop />
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:id" element={<ProductDetail />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/courses" element={<Courses />} />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/orders" element={<OrderAdmin />} />
                          <Route path="/admin/quotes" element={<QuoteAdmin />} />
                          <Route path="/admin/products" element={<ProductAdmin />} />
                          <Route path="/admin/enrollments" element={<EnrollmentAdmin />} />
                          <Route path="/admin/emails" element={<EmailAdmin />} />
                          <Route path="/admin/chat" element={<ChatAdmin />} />
                          <Route path="/admin/security" element={<SecurityDashboard />} />
                          <Route path="/customer-profile" element={<CustomerProfile />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/my-orders" element={<MyOrders />} />
                          <Route path="/order-lookup" element={<SecureOrderLookup />} />
                          <Route path="/verify-newsletter" element={<VerifyNewsletter />} />
                          <Route path="/mobile" element={<MobileApp />} />
                          <Route path="/mobile-admin" element={<MobileAdminDashboard />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/refund-policy" element={<RefundPolicy />} />
                          <Route path="/return-policy" element={<ReturnPolicy />} />
                          <Route path="/shipping-policy" element={<ShippingPolicy />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </SecurityMiddleware>
                    </BrowserRouter>
                  </LanguagePreferenceWrapper>
                </SecurityMonitor>
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </SEOProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
