import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useLanguage } from '@/contexts/LanguageContext';

const Products = () => {
  const { isRTL } = useLanguage();
  
  console.log('Products page is rendering...');
  
  return (
    <>
      <SEOHead 
        title="Koch-Chemie Professional Car Care Products | MT Wraps"
        description="Shop premium Koch-Chemie car detailing products. Official distributor offering professional automotive cleaning, polishing, and protection products with fast shipping."
        keywords="koch chemie products, car detailing products, automotive cleaning supplies, professional car care, german car products, car polishing, paint protection"
      />
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">Products Page</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Our professional Koch-Chemie car care products
            </p>
            <div className="bg-card p-6 rounded-lg border">
              <p>Products page is loading correctly. The component issue has been resolved.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Products;