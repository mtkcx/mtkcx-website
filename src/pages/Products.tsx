import React from 'react';
import Header from '@/components/Header';
import ProductCatalog from '@/components/ProductCatalog';
import MobileProductCatalog from '@/components/mobile/MobileProductCatalog';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Products = () => {
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  
  console.log('Products page rendering - isMobile:', isMobile, 'isRTL:', isRTL);
  
  return (
    <>
      <SEOHead 
        title="Koch-Chemie Professional Car Care Products | MT Wraps"
        description="Shop premium Koch-Chemie car detailing products. Official distributor offering professional automotive cleaning, polishing, and protection products with fast shipping."
        keywords="koch chemie products, car detailing products, automotive cleaning supplies, professional car care, german car products, car polishing, paint protection"
      />
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <div className="block md:hidden">
          <div className="pt-4 pb-20">
            <MobileProductCatalog />
          </div>
        </div>
        <div className="hidden md:block">
          <ProductCatalog />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Products;