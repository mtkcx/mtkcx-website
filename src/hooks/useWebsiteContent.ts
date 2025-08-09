import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseContentReturn {
  content: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

export const useWebsiteContent = (pageName?: string): UseContentReturn => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('page_content')
          .select('page_name, section_name, content_key, content_value')
          .eq('is_active', true);

        if (pageName) {
          query = query.eq('page_name', pageName);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Convert to flat key-value pairs for easy access
        const contentMap: Record<string, string> = {};
        data?.forEach(item => {
          const key = `${item.page_name}.${item.section_name}.${item.content_key}`;
          contentMap[key] = item.content_value || '';
        });

        setContent(contentMap);
      } catch (err) {
        console.error('Error loading content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [pageName]);

  return { content, isLoading, error };
};

export const useSiteSettings = (): UseContentReturn => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value');

        if (fetchError) throw fetchError;

        // Convert to key-value pairs
        const settingsMap: Record<string, string> = {};
        data?.forEach(item => {
          settingsMap[item.setting_key] = item.setting_value || '';
        });

        setContent(settingsMap);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { content, isLoading, error };
};