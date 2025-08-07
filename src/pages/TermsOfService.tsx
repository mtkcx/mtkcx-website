import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

const TermsOfService = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={t('policies.terms_title')}
        description={t('policies.terms_meta_desc')}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{t('policies.terms_title')}</h1>
          <p className="text-muted-foreground mb-8">{t('policies.last_updated')}: January 2025</p>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.acceptance')}</h2>
              <p>{t('policies.terms.acceptance_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.services')}</h2>
              <p className="mb-4">{t('policies.terms.services_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.terms.car_detailing')}</li>
                <li>{t('policies.terms.car_wrapping')}</li>
                <li>{t('policies.terms.product_sales')}</li>
                <li>{t('policies.terms.training_courses')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.orders')}</h2>
              <p className="mb-4">{t('policies.terms.orders_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.terms.order_accuracy')}</li>
                <li>{t('policies.terms.availability')}</li>
                <li>{t('policies.terms.pricing')}</li>
                <li>{t('policies.terms.payment_terms')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.user_conduct')}</h2>
              <p className="mb-4">{t('policies.terms.user_conduct_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.terms.lawful_use')}</li>
                <li>{t('policies.terms.accurate_info')}</li>
                <li>{t('policies.terms.no_interference')}</li>
                <li>{t('policies.terms.respect_ip')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.intellectual_property')}</h2>
              <p>{t('policies.terms.intellectual_property_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.liability')}</h2>
              <p>{t('policies.terms.liability_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.modifications')}</h2>
              <p>{t('policies.terms.modifications_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.terms.governing_law')}</h2>
              <p>{t('policies.terms.governing_law_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.contact_us')}</h2>
              <p>{t('policies.terms.contact_desc')}</p>
              <p className="font-medium">Email: info@mtkcx.com</p>
              <p className="font-medium">Phone: 052-7738-586</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;