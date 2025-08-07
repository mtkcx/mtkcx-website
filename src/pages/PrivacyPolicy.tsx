import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';

const PrivacyPolicy = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      <SEOHead 
        title={t('policies.privacy_title')}
        description={t('policies.privacy_meta_desc')}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{t('policies.privacy_title')}</h1>
          <p className="text-muted-foreground mb-8">{t('policies.last_updated')}: January 2025</p>
          
          <div className="prose prose-lg max-w-none text-foreground space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.privacy.info_collection')}</h2>
              <p className="mb-4">{t('policies.privacy.info_collection_desc')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.privacy.personal_info')}</li>
                <li>{t('policies.privacy.contact_info')}</li>
                <li>{t('policies.privacy.order_info')}</li>
                <li>{t('policies.privacy.payment_info')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.privacy.info_use')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.privacy.process_orders')}</li>
                <li>{t('policies.privacy.communicate')}</li>
                <li>{t('policies.privacy.improve_services')}</li>
                <li>{t('policies.privacy.marketing')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.privacy.data_protection')}</h2>
              <p>{t('policies.privacy.data_protection_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.privacy.third_party')}</h2>
              <p>{t('policies.privacy.third_party_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.privacy.cookies')}</h2>
              <p>{t('policies.privacy.cookies_desc')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.privacy.rights')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('policies.privacy.access_data')}</li>
                <li>{t('policies.privacy.correct_data')}</li>
                <li>{t('policies.privacy.delete_data')}</li>
                <li>{t('policies.privacy.restrict_processing')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('policies.contact_us')}</h2>
              <p>{t('policies.privacy.contact_desc')}</p>
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

export default PrivacyPolicy;