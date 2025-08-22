import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ServiceSection from '@/components/ServiceSection';
import ProductCategoriesSection from '@/components/ProductCategoriesSection';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';

import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { isRTL } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <Hero />
      <ServiceSection />
      <ProductCategoriesSection />
      <Footer />
      <NewsletterPopup />
    </div>
  );
};

export default Index;
