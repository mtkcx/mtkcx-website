import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const defaultTitle = 'MTKCx | Koch-Chemie Distribution Partner';
  const defaultDescription = 'MTKCx - Official Koch-Chemie distribution partner offering premium German car detailing products, professional training courses, and expert automotive care services.';
  const defaultKeywords = 'MTKCx, koch chemie, car detailing, automotive cleaning, professional car care, german car products, distribution partner, detailing training';
  const defaultImage = 'https://kochchemie-east-hub.lovable.app/lovable-uploads/7aeda162-d142-4d3d-83a9-a5aa8e613e41.png';
  const baseUrl = 'https://kochchemie-east-hub.lovable.app';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;
  const finalUrl = url || baseUrl;

  return (
    <Helmet>
      {/* Favicon */}
      <link rel="icon" href="/lovable-uploads/c9035b98-872b-42aa-ba81-c7d2d01c27ef.png?v=3" type="image/png" />
      
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