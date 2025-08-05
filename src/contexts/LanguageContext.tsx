import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'he';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.courses': 'Courses',
    'nav.wrapping': 'Car Wrapping',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Premium Car Care & Training Solutions',
    'hero.subtitle': 'Official Koch-Chemie distributor offering professional detailing products, expert training courses, and premium car wrapping services.',
    'hero.cta.products': 'Shop Products',
    'hero.cta.courses': 'View Courses',
    
    // Common
    'common.learn_more': 'Learn More',
    'common.contact_us': 'Contact Us',
    'common.get_started': 'Get Started',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.courses': 'الدورات',
    'nav.wrapping': 'تغليف السيارات',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    
    // Hero Section
    'hero.title': 'حلول العناية بالسيارات والتدريب المتميزة',
    'hero.subtitle': 'الموزع الرسمي لكوخ كيمي يقدم منتجات التنظيف المهنية ودورات التدريب المتخصصة وخدمات تغليف السيارات المتميزة.',
    'hero.cta.products': 'تسوق المنتجات',
    'hero.cta.courses': 'عرض الدورات',
    
    // Common
    'common.learn_more': 'اعرف أكثر',
    'common.contact_us': 'اتصل بنا',
    'common.get_started': 'ابدأ الآن',
  },
  he: {
    // Navigation
    'nav.home': 'בית',
    'nav.products': 'מוצרים',
    'nav.courses': 'קורסים',
    'nav.wrapping': 'עיטוף רכבים',
    'nav.about': 'אודות',
    'nav.contact': 'צור קשר',
    
    // Hero Section
    'hero.title': 'פתרונות טיפוח רכב והכשרה מתקדמים',
    'hero.subtitle': 'מפיץ רשמי של Koch-Chemie המציע מוצרי ניקיון מקצועיים, קורסי הכשרה מומחים ושירותי עיטוף רכבים מתקדמים.',
    'hero.cta.products': 'קנה מוצרים',
    'hero.cta.courses': 'צפה בקורסים',
    
    // Common
    'common.learn_more': 'למד עוד',
    'common.contact_us': 'צור קשר',
    'common.get_started': 'התחל',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    document.dir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations[typeof currentLanguage]] || key;
  };

  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};