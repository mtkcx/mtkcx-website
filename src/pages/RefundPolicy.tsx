import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

const RefundPolicy = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={t('policies.refund_title')}
        description={t('policies.refund_meta_desc')}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{t('policies.refund_title')}</h1>
          <p className="text-muted-foreground mb-8">{t('policies.last_updated')}: January 2025</p>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.overview')}</h2>
              <p>{t('policies.refund.overview_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.eligibility')}</h2>
              <p className="mb-4">{t('policies.refund.eligibility_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.refund.defective_products')}</li>
                <li>{t('policies.refund.wrong_items')}</li>
                <li>{t('policies.refund.damaged_delivery')}</li>
                <li>{t('policies.refund.quality_issues')}</li>
                <li>{t('policies.refund.service_cancellation')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.non_refundable')}</h2>
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <p className="mb-4 text-red-800">{t('policies.refund.non_refundable_desc')}</p>
                <ul className="list-disc pl-6 space-y-2 text-red-700">
                  <li>{t('policies.refund.used_products')}</li>
                  <li>{t('policies.refund.change_of_mind')}</li>
                  <li>{t('policies.refund.custom_orders')}</li>
                  <li>{t('policies.refund.completed_services')}</li>
                  <li>{t('policies.refund.digital_products')}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.process')}</h2>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">{t('policies.refund.full_refunds')}</h3>
                  <p className="text-blue-700">{t('policies.refund.full_refunds_desc')}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">{t('policies.refund.partial_refunds')}</h3>
                  <p className="text-yellow-700">{t('policies.refund.partial_refunds_desc')}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.processing_time')}</h2>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <ul className="list-disc pl-6 space-y-2 text-green-800">
                  <li>{t('policies.refund.review_time')}: 1-3 {t('policies.shipping.business_days')}</li>
                  <li>{t('policies.refund.approval_time')}: 3-5 {t('policies.shipping.business_days')}</li>
                  <li>{t('policies.refund.payment_time')}: 5-10 {t('policies.shipping.business_days')}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.payment_methods')}</h2>
              <p className="mb-4">{t('policies.refund.payment_methods_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.refund.cash_refund')}</li>
                <li>{t('policies.refund.bank_transfer')}</li>
                <li>{t('policies.refund.store_credit')}</li>
                <li>{t('policies.refund.original_method')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.cancellations')}</h2>
              <p className="mb-4">{t('policies.refund.cancellations_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.refund.before_processing')}</li>
                <li>{t('policies.refund.during_processing')}</li>
                <li>{t('policies.refund.after_shipping')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.refund.disputes')}</h2>
              <p>{t('policies.refund.disputes_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.contact_us')}</h2>
              <p>{t('policies.refund.contact_desc')}</p>
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

export default RefundPolicy;