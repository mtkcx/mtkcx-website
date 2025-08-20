import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ServiceSection from '@/components/ServiceSection';
import ProductCategoriesSection from '@/components/ProductCategoriesSection';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';
import ChatBot from '@/components/ChatBot';

import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { isRTL } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <Hero />
      
      {/* Certified Course Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black rounded-lg p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Certified Car Polishing & Detailing Course
              </h2>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Join a specialized course that provides theoretical knowledge and practical experience in comprehensive car care, with official certification from Koch Chemie - the world-leading company in this field.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <ServiceSection />
      <ProductCategoriesSection />
      <Footer />
      <NewsletterPopup />
    </div>
  );
};

export default Index;
