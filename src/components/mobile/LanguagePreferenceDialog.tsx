import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface LanguagePreferenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguagePreferenceDialog: React.FC<LanguagePreferenceDialogProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar' | 'he'>(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦'
    },
    {
      code: 'he',
      name: 'Hebrew',
      nativeName: 'עברית',
      flag: '🇮🇱'
    }
  ];

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode as 'en' | 'ar' | 'he');
  };

  const handleSavePreference = async () => {
    setIsLoading(true);
    try {
      // Set the language in the context
      setLanguage(selectedLanguage);
      
      // Save to localStorage for persistence
      localStorage.setItem('preferred-language', selectedLanguage);
      localStorage.setItem('language-preference-set', 'true');

      // Generate a device ID for guest users
      let deviceId = localStorage.getItem('device-id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device-id', deviceId);
      }

      // Save user preference to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          device_id: deviceId,
          preferred_language: selectedLanguage,
          push_notifications_enabled: true,
          order_notifications_enabled: true,
          marketing_notifications_enabled: false
        }, {
          onConflict: 'device_id'
        });

      if (error) {
        console.error('Error saving language preference:', error);
      }

      onClose();
    } catch (error) {
      console.error('Error setting language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const messages = {
      en: {
        title: 'Welcome to MT KCx!',
        subtitle: 'Please select your preferred language',
        description: 'This will be used for all notifications and communications.'
      },
      ar: {
        title: 'مرحباً بك في MT KCx!',
        subtitle: 'يرجى اختيار لغتك المفضلة',
        description: 'سيتم استخدام هذا لجميع الإشعارات والاتصالات.'
      },
      he: {
        title: 'ברוכים הבאים ל-MT KCx!',
        subtitle: 'אנא בחר את השפה המועדפת עליך',
        description: 'זה ישמש לכל ההודעות והתקשורת.'
      }
    };
    return messages[selectedLanguage as keyof typeof messages] || messages.en;
  };

  const welcomeMsg = getWelcomeMessage();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <Globe className="h-16 w-16 text-primary mx-auto mb-2" />
          </div>
          <DialogTitle className="text-xl" dir={selectedLanguage === 'ar' || selectedLanguage === 'he' ? 'rtl' : 'ltr'}>
            {welcomeMsg.title}
          </DialogTitle>
          <p className="text-muted-foreground" dir={selectedLanguage === 'ar' || selectedLanguage === 'he' ? 'rtl' : 'ltr'}>
            {welcomeMsg.subtitle}
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {languages.map((language) => (
            <Card
              key={language.code}
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedLanguage === language.code
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.name}</div>
                    <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4" dir={selectedLanguage === 'ar' || selectedLanguage === 'he' ? 'rtl' : 'ltr'}>
            {welcomeMsg.description}
          </p>
          <Button 
            onClick={handleSavePreference} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {selectedLanguage === 'ar' ? 'جاري الحفظ...' : selectedLanguage === 'he' ? 'שומר...' : 'Saving...'}
              </div>
            ) : (
              selectedLanguage === 'ar' ? 'تأكيد الاختيار' : selectedLanguage === 'he' ? 'אישור בחירה' : 'Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};