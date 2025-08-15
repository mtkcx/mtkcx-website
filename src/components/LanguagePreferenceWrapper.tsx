import React, { useState, useEffect } from 'react';
import LanguagePreferenceModal from './LanguagePreferenceModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const LanguagePreferenceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const checkLanguagePreference = async () => {
      // Check if language preference has been set before
      const hasSetPreference = localStorage.getItem('language-preference-set');
      
      if (!hasSetPreference) {
        // Try to load language preference from database using device ID
        const deviceId = localStorage.getItem('device-id');
        
        if (deviceId) {
          try {
            const { data } = await supabase
              .from('user_preferences')
              .select('preferred_language')
              .eq('device_id', deviceId)
              .single();
              
            if (data?.preferred_language) {
              // Set the language and mark as configured
              setLanguage(data.preferred_language as 'en' | 'ar' | 'he');
              localStorage.setItem('preferred-language', data.preferred_language);
              localStorage.setItem('language-preference-set', 'true');
              return;
            }
          } catch (error) {
            console.log('No existing language preference found');
          }
        }
        
        // If no preference found, show the modal
        setShowLanguageModal(true);
      } else {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && ['en', 'ar', 'he'].includes(savedLanguage)) {
          setLanguage(savedLanguage as 'en' | 'ar' | 'he');
        }
      }
    };

    checkLanguagePreference();
  }, [setLanguage]);

  const handleLanguageModalClose = () => {
    setShowLanguageModal(false);
  };

  return (
    <>
      {children}
      <LanguagePreferenceModal 
        isOpen={showLanguageModal} 
        onClose={handleLanguageModalClose} 
      />
    </>
  );
};

export default LanguagePreferenceWrapper;