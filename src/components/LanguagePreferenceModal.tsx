import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface LanguagePreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguagePreferenceModal: React.FC<LanguagePreferenceModalProps> = ({ isOpen, onClose }) => {
  const { setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar' | 'he'>('en');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { 
      code: 'en' as const, 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸' 
    },
    { 
      code: 'ar' as const, 
      name: 'Arabic', 
      nativeName: 'العربية',
      flag: '🇸🇦' 
    },
    { 
      code: 'he' as const, 
      name: 'Hebrew', 
      nativeName: 'עברית',
      flag: '🇮🇱' 
    }
  ];

  const handleLanguageSelect = (langCode: 'en' | 'ar' | 'he') => {
    setSelectedLanguage(langCode);
  };

  const handleSavePreference = async () => {
    setIsLoading(true);
    
    try {
      // Set the language in context
      setLanguage(selectedLanguage);
      
      // Save to local storage for persistence
      localStorage.setItem('preferred-language', selectedLanguage);
      
      // Generate or get device ID for preference tracking
      let deviceId = localStorage.getItem('device-id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('device-id', deviceId);
      }
      
      // Save language preference to database
      await supabase
        .from('user_preferences')
        .upsert({
          device_id: deviceId,
          preferred_language: selectedLanguage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'device_id'
        });
      
      // Mark that language has been chosen
      localStorage.setItem('language-preference-set', 'true');
      
      onClose();
    } catch (error) {
      console.error('Error saving language preference:', error);
      // Still proceed with language setting even if database save fails
      setLanguage(selectedLanguage);
      localStorage.setItem('preferred-language', selectedLanguage);
      localStorage.setItem('language-preference-set', 'true');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    switch (selectedLanguage) {
      case 'ar':
        return {
          title: 'اختر لغتك المفضلة',
          subtitle: 'سيتم حفظ اختيارك لزياراتك المستقبلية'
        };
      case 'he':
        return {
          title: 'בחר את השפה המועדפת עליך',
          subtitle: 'הבחירה שלך תישמר לביקורים עתידיים'
        };
      default:
        return {
          title: 'Choose Your Preferred Language',
          subtitle: 'Your choice will be saved for future visits'
        };
    }
  };

  const welcomeMsg = getWelcomeMessage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {welcomeMsg.title}
          </DialogTitle>
          <p className="text-muted-foreground">
            {welcomeMsg.subtitle}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between hover:border-primary/50 ${
                  selectedLanguage === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{lang.name}</div>
                    <div className="text-sm text-muted-foreground">{lang.nativeName}</div>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>

          <Button
            onClick={handleSavePreference}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {isLoading ? (
              selectedLanguage === 'ar' ? 'جاري الحفظ...' :
              selectedLanguage === 'he' ? 'שומר...' : 
              'Saving...'
            ) : (
              selectedLanguage === 'ar' ? 'احفظ التفضيل' :
              selectedLanguage === 'he' ? 'שמור העדפה' : 
              'Save Preference'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguagePreferenceModal;