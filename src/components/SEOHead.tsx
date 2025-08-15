import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSEO } from '@/contexts/SEOContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData
}) => {
  const { currentLanguage } = useLanguage();
  const { seoSettings } = useSEO();
  const baseUrl = 'https://kochchemie-east-hub.lovable.app';

  const finalTitle = title || seoSettings.site_title;
  const finalDescription = description || seoSettings.site_description;
  const finalKeywords = keywords || seoSettings.site_keywords;
  const finalImage = image || seoSettings.og_image_url;
  const finalUrl = url || baseUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={finalUrl} />
      <html lang={currentLanguage} dir={currentLanguage === 'ar' || currentLanguage === 'he' ? 'rtl' : 'ltr'} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MTKCx" />
      <meta property="og:locale" content={currentLanguage === 'ar' ? 'ar_SA' : currentLanguage === 'he' ? 'he_IL' : 'en_US'} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;