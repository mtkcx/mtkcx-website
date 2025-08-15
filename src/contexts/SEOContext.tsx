import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  favicon_url: string;
  og_image_url: string;
}

interface SEOContextType {
  seoSettings: SEOSettings;
  loading: boolean;
  refreshSEOSettings: () => Promise<void>;
}

const defaultSEOSettings: SEOSettings = {
  site_title: 'MTKCx | Koch-Chemie Distribution Partner',
  site_description: 'Official Koch-Chemie distributor offering premium German car detailing products, professional training courses, and expert car wrapping services. Shop authentic Koch-Chemie products online.',
  site_keywords: 'koch chemie, car detailing, automotive cleaning, professional car care, german car products, car wrapping, detailing training, MT Wraps',
  favicon_url: '/favicon.png',
  og_image_url: 'https://kochchemie-east-hub.lovable.app/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png'
};

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};

interface SEOProviderProps {
  children: ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ children }) => {
  const [seoSettings, setSEOSettings] = useState<SEOSettings>(defaultSEOSettings);
  const [loading, setLoading] = useState(true);

  const fetchSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'seo_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.setting_value) {
        const seoData = JSON.parse(data.setting_value as string);
        setSEOSettings(seoData);
        
        // Update document title immediately
        if (seoData.site_title) {
          document.title = seoData.site_title;
        }
        
        // Update favicon if needed
        if (seoData.favicon_url) {
          const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (faviconLink) {
            faviconLink.href = seoData.favicon_url;
          } else {
            // Create favicon link if it doesn't exist
            const newFaviconLink = document.createElement('link');
            newFaviconLink.rel = 'icon';
            newFaviconLink.type = 'image/png';
            newFaviconLink.href = seoData.favicon_url;
            document.head.appendChild(newFaviconLink);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      setSEOSettings(defaultSEOSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSEOSettings = async () => {
    setLoading(true);
    await fetchSEOSettings();
  };

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  return (
    <SEOContext.Provider value={{ seoSettings, loading, refreshSEOSettings }}>
      {children}
    </SEOContext.Provider>
  );
};