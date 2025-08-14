
import React from 'react';
import Header from '@/components/Header';
import OptimizedProductCatalog from '@/components/OptimizedProductCatalog';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useLanguage } from '@/contexts/LanguageContext';

const Products = () => {
  const { isRTL } = useLanguage();
  
  return (
    <>
      <SEOHead 
        title="Koch-Chemie Professional Car Care Products | MT Wraps"
        description="Shop premium Koch-Chemie car detailing products. Official distributor offering professional automotive cleaning, polishing, and protection products with fast shipping."
        keywords="koch chemie products, car detailing products, automotive cleaning supplies, professional car care, german car products, car polishing, paint protection"
      />
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <OptimizedProductCatalog />
        <Footer />
      </div>
    </>
  );
};

export default Products;
