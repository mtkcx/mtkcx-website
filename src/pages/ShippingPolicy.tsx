import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

const ShippingPolicy = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={t('policies.shipping_title')}
        description={t('policies.shipping_meta_desc')}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{t('policies.shipping_title')}</h1>
          <p className="text-muted-foreground mb-8">{t('policies.last_updated')}: January 2025</p>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.overview')}</h2>
              <p>{t('policies.shipping.overview_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.processing_time')}</h2>
              <p className="mb-4">{t('policies.shipping.processing_desc')}</p>
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2">{t('policies.shipping.processing_timeline')}</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('policies.shipping.order_processing')}: 3-5 {t('policies.shipping.business_days')}</li>
                  <li>{t('policies.shipping.shipping_time')}: 7-10 {t('policies.shipping.business_days')}</li>
                  <li>{t('policies.shipping.total_delivery')}: 7-10 {t('policies.shipping.business_days')}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.payment_method')}</h2>
              <div className="bg-accent/5 p-6 rounded-lg border border-accent/10 mb-6">
                <h3 className="font-semibold mb-2 text-accent-foreground">{t('policies.shipping.cod_title')}</h3>
                <p className="mb-4">{t('policies.shipping.cod_desc')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('policies.shipping.cash_payment')}</li>
                  <li>{t('policies.shipping.delivery_confirmation')}</li>
                  <li>{t('policies.shipping.id_required')}</li>
                </ul>
              </div>
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2">{t('policies.shipping.credit_card_title')}</h3>
                <p className="mb-4">{t('policies.shipping.credit_card_desc')}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t('policies.shipping.credit_card_call')}</li>
                  <li>{t('policies.shipping.credit_card_secure')}</li>
                  <li>{t('policies.shipping.credit_card_processing')}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.delivery_areas')}</h2>
              <p className="mb-4">{t('policies.shipping.delivery_areas_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.shipping.nationwide_delivery')}</li>
                <li>{t('policies.shipping.urban_areas')}</li>
                <li>{t('policies.shipping.remote_areas')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.tracking')}</h2>
              <p className="mb-4">{t('policies.shipping.tracking_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.shipping.tracking_info')}</li>
                <li>{t('policies.shipping.delivery_updates')}</li>
                <li>{t('policies.shipping.contact_support')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.delivery_issues')}</h2>
              <p className="mb-4">{t('policies.shipping.delivery_issues_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.shipping.failed_delivery')}</li>
                <li>{t('policies.shipping.incorrect_address')}</li>
                <li>{t('policies.shipping.recipient_unavailable')}</li>
                <li>{t('policies.shipping.damaged_package')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.shipping.special_items')}</h2>
              <p className="mb-4">{t('policies.shipping.special_items_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.shipping.chemicals')}</li>
                <li>{t('policies.shipping.equipment')}</li>
                <li>{t('policies.shipping.bulk_orders')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.contact_us')}</h2>
              <p>{t('policies.shipping.contact_desc')}</p>
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

export default ShippingPolicy;