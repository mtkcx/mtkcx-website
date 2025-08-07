import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

const ReturnPolicy = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={t('policies.return_title')}
        description={t('policies.return_meta_desc')}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{t('policies.return_title')}</h1>
          <p className="text-muted-foreground mb-8">{t('policies.last_updated')}: January 2025</p>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.overview')}</h2>
              <p>{t('policies.return.overview_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.timeline')}</h2>
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('policies.return.30_days')}</li>
                  <li>{t('policies.return.original_condition')}</li>
                  <li>{t('policies.return.original_packaging')}</li>
                  <li>{t('policies.return.proof_purchase')}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.eligible_items')}</h2>
              <p className="mb-4">{t('policies.return.eligible_desc')}</p>
              <ul className="list-disc pl-6 space-y-2 text-green-700">
                <li>{t('policies.return.unopened_products')}</li>
                <li>{t('policies.return.defective_items')}</li>
                <li>{t('policies.return.wrong_items')}</li>
                <li>{t('policies.return.damaged_shipping')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.non_returnable')}</h2>
              <p className="mb-4">{t('policies.return.non_returnable_desc')}</p>
              <ul className="list-disc pl-6 space-y-2 text-red-700">
                <li>{t('policies.return.used_chemicals')}</li>
                <li>{t('policies.return.opened_liquids')}</li>
                <li>{t('policies.return.custom_items')}</li>
                <li>{t('policies.return.perishable_items')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.process')}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h3 className="font-semibold">{t('policies.return.step1_title')}</h3>
                    <p className="text-muted-foreground">{t('policies.return.step1_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h3 className="font-semibold">{t('policies.return.step2_title')}</h3>
                    <p className="text-muted-foreground">{t('policies.return.step2_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h3 className="font-semibold">{t('policies.return.step3_title')}</h3>
                    <p className="text-muted-foreground">{t('policies.return.step3_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h3 className="font-semibold">{t('policies.return.step4_title')}</h3>
                    <p className="text-muted-foreground">{t('policies.return.step4_desc')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.refund_timeline')}</h2>
              <p>{t('policies.return.refund_timeline_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.return.exchanges')}</h2>
              <p>{t('policies.return.exchanges_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.contact_us')}</h2>
              <p>{t('policies.return.contact_desc')}</p>
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

export default ReturnPolicy;