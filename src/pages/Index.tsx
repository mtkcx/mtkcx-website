import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ServiceSection from '@/components/ServiceSection';
import ProductCategoriesSection from '@/components/ProductCategoriesSection';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';
import ChatBot from '@/components/ChatBot';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ServiceSection />
      <ProductCategoriesSection />
      <Footer />
      <NewsletterPopup />
      <ChatBot />
    </div>
  );
};

export default Index;
