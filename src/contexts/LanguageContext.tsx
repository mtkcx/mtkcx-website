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
    
    // Services Section
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive Car Care solutions from products to training to premium wrapping services',
    'services.koch_title': 'Koch-Chemie Products',
    'services.koch_description': 'Professional-grade car care products from Germany\'s leading manufacturer.',
    'services.koch_features.1': 'Premium car care',
    'services.koch_features.2': 'Professional detailing',
    'services.koch_features.3': 'Industry-leading quality',
    'services.koch_cta': 'View Products',
    'services.courses_title': 'Detailing Courses',
    'services.courses_description': 'Expert training programs for professional car detailing and polishing techniques.',
    'services.courses_features.1': 'Hands-on training',
    'services.courses_features.2': 'Online & in-person',
    'services.courses_features.3': 'Certification included',
    'services.courses_cta': 'Enroll Today',
    'services.wrapping_title': 'MT Wraps Services',
    'services.wrapping_description': 'Premium car wrapping and vinyl installation services for a stunning finish.',
    'services.wrapping_features.1': 'Custom designs',
    'services.wrapping_features.2': 'Premium materials',
    'services.wrapping_features.3': 'Expert installation',
    'services.wrapping_cta': 'View Gallery',

    // Gallery/Wrapping Page
    'gallery.title': 'Professional Vehicle Wrapping',
    'gallery.subtitle': 'Transform your vehicle with premium automotive films. From complete color changes to protective solutions, we deliver exceptional results with industry-leading materials.',
    'gallery.services_title': 'Our Wrapping Services',
    'gallery.services_subtitle': 'Contact us to discuss your needs from our variety of professional vehicle wrapping and detailing services',
    'gallery.professional_title': 'Professional Vehicle Services',
    'gallery.professional_description': 'We offer a comprehensive range of vehicle wrapping and detailing services. Contact us to discuss which service best fits your needs and budget.',
    'gallery.wrapping_services': 'Wrapping Services',
    'gallery.additional_services': 'Additional Services',
    'gallery.why_choose': 'Why Choose Our Services?',
    'gallery.premium_materials': 'Premium Materials',
    'gallery.premium_materials_desc': 'Industry-leading automotive films',
    'gallery.expert_installation': 'Expert Installation',
    'gallery.expert_installation_desc': 'Professional certified technicians',
    'gallery.quality_guarantee': 'Quality Guarantee',
    'gallery.quality_guarantee_desc': 'Warranty on all services',
    'gallery.contact_quote': 'Ready to transform your vehicle? Contact us to discuss your project and get a personalized quote.',
    'gallery.contact_for_quote': 'Contact for Quote',
    'gallery.request_consultation': 'Request Consultation',

    // Courses Page
    'courses.title': 'Koch Chemie Professional Certification',
    'courses.subtitle': 'Master both detailing and polishing techniques in our comprehensive 4-day certification program, taught according to Koch Chemie\'s world-renowned standards and methodologies.',
    'courses.intro_title': 'Course Introduction',
    'courses.intro_subtitle': 'Watch our detailed explanation of what you\'ll learn in this certification course',
    'courses.course_title': 'Detailing & Polishing Certification Course',
    'courses.course_description': 'Our comprehensive 4-day program combines interactive learning with hands-on training, culminating in official Koch Chemie certification recognized industry-wide.',
    'courses.what_learn': 'What You\'ll Learn',
    'courses.course_structure': '4-Day Course Structure',
    'courses.why_choose': 'Why Choose Our Koch Chemie Certification?',
    'courses.enroll_now': 'Enroll Now',
    'courses.contact_details': 'Contact for Details',
    
    // Common
    'common.learn_more': 'Learn More',
    'common.contact_us': 'Contact Us',
    'common.get_started': 'Get Started',
    'common.search': 'Search',
    'common.professional_training': 'Professional Training',
    'common.mt_wraps_services': 'MT Wraps Services',
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
    
    // Services Section
    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول شاملة للعناية بالسيارات من المنتجات إلى التدريب وخدمات التغليف المتميزة',
    'services.koch_title': 'منتجات كوخ كيمي',
    'services.koch_description': 'منتجات العناية بالسيارات الاحترافية من الشركة الرائدة في ألمانيا.',
    'services.koch_features.1': 'العناية المتميزة بالسيارات',
    'services.koch_features.2': 'التنظيف المهني',
    'services.koch_features.3': 'جودة رائدة في الصناعة',
    'services.koch_cta': 'عرض المنتجات',
    'services.courses_title': 'دورات التنظيف',
    'services.courses_description': 'برامج تدريبية متخصصة لتقنيات تنظيف وتلميع السيارات المهنية.',
    'services.courses_features.1': 'تدريب عملي',
    'services.courses_features.2': 'عبر الإنترنت وشخصياً',
    'services.courses_features.3': 'يشمل الشهادة',
    'services.courses_cta': 'سجل اليوم',
    'services.wrapping_title': 'خدمات إم تي رابس',
    'services.wrapping_description': 'خدمات تغليف السيارات المتميزة وتركيب الفينيل للحصول على إطلالة مذهلة.',
    'services.wrapping_features.1': 'تصاميم مخصصة',
    'services.wrapping_features.2': 'مواد متميزة',
    'services.wrapping_features.3': 'تركيب احترافي',
    'services.wrapping_cta': 'عرض المعرض',

    // Gallery/Wrapping Page
    'gallery.title': 'تغليف السيارات المهني',
    'gallery.subtitle': 'حوّل سيارتك باستخدام أفلام السيارات المتميزة. من تغييرات الألوان الكاملة إلى حلول الحماية، نقدم نتائج استثنائية بمواد رائدة في الصناعة.',
    'gallery.services_title': 'خدمات التغليف لدينا',
    'gallery.services_subtitle': 'اتصل بنا لمناقشة احتياجاتك من مجموعة متنوعة من خدمات تغليف السيارات والتنظيف المهنية',
    'gallery.professional_title': 'خدمات السيارات المهنية',
    'gallery.professional_description': 'نقدم مجموعة شاملة من خدمات تغليف السيارات والتنظيف. اتصل بنا لمناقشة الخدمة التي تناسب احتياجاتك وميزانيتك.',
    'gallery.wrapping_services': 'خدمات التغليف',
    'gallery.additional_services': 'خدمات إضافية',
    'gallery.why_choose': 'لماذا تختار خدماتنا؟',
    'gallery.premium_materials': 'مواد متميزة',
    'gallery.premium_materials_desc': 'أفلام السيارات الرائدة في الصناعة',
    'gallery.expert_installation': 'تركيب احترافي',
    'gallery.expert_installation_desc': 'فنيون محترفون معتمدون',
    'gallery.quality_guarantee': 'ضمان الجودة',
    'gallery.quality_guarantee_desc': 'ضمان على جميع الخدمات',
    'gallery.contact_quote': 'جاهز لتحويل سيارتك؟ اتصل بنا لمناقشة مشروعك والحصول على عرض أسعار مخصص.',
    'gallery.contact_for_quote': 'اتصل للحصول على عرض أسعار',
    'gallery.request_consultation': 'طلب استشارة',

    // Courses Page
    'courses.title': 'شهادة كوخ كيمي المهنية',
    'courses.subtitle': 'أتقن تقنيات التنظيف والتلميع في برنامج الشهادة الشامل لمدة 4 أيام، يُدرّس وفقاً لمعايير ومنهجيات كوخ كيمي المشهورة عالمياً.',
    'courses.intro_title': 'مقدمة الدورة',
    'courses.intro_subtitle': 'شاهد شرحنا المفصل لما ستتعلمه في دورة الشهادة هذه',
    'courses.course_title': 'دورة شهادة التنظيف والتلميع',
    'courses.course_description': 'برنامجنا الشامل لمدة 4 أيام يجمع بين التعلم التفاعلي والتدريب العملي، وينتهي بشهادة كوخ كيمي الرسمية المعترف بها في جميع أنحاء الصناعة.',
    'courses.what_learn': 'ما ستتعلمه',
    'courses.course_structure': 'هيكل الدورة لمدة 4 أيام',
    'courses.why_choose': 'لماذا تختار شهادة كوخ كيمي لدينا؟',
    'courses.enroll_now': 'سجل الآن',
    'courses.contact_details': 'اتصل للتفاصيل',
    
    // Common
    'common.learn_more': 'اعرف أكثر',
    'common.contact_us': 'اتصل بنا',
    'common.get_started': 'ابدأ الآن',
    'common.search': 'بحث',
    'common.professional_training': 'التدريب المهني',
    'common.mt_wraps_services': 'خدمات إم تي رابس',
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
    
    // Services Section
    'services.title': 'השירותים שלנו',
    'services.subtitle': 'פתרונות טיפוח רכב מקיפים מתוצרים להכשרה ושירותי עיטוף מתקדמים',
    'services.koch_title': 'מוצרי Koch-Chemie',
    'services.koch_description': 'מוצרי טיפוח רכב מקצועיים מהיצרן המוביל בגרמניה.',
    'services.koch_features.1': 'טיפוח רכב מתקדם',
    'services.koch_features.2': 'ניקיון מקצועי',
    'services.koch_features.3': 'איכות מובילה בתעשייה',
    'services.koch_cta': 'צפה במוצרים',
    'services.courses_title': 'קורסי ניקיון',
    'services.courses_description': 'תוכניות הכשרה מקצועיות לטכניקות ניקיון והברקת רכבים מקצועיים.',
    'services.courses_features.1': 'הכשרה מעשית',
    'services.courses_features.2': 'באינטרנט ובאופן אישי',
    'services.courses_features.3': 'כולל הסמכה',
    'services.courses_cta': 'הירשם היום',
    'services.wrapping_title': 'שירותי MT Wraps',
    'services.wrapping_description': 'שירותי עיטוף רכבים מתקדמים והתקנת ויניל למראה מדהים.',
    'services.wrapping_features.1': 'עיצובים מותאמים אישית',
    'services.wrapping_features.2': 'חומרים מתקדמים',
    'services.wrapping_features.3': 'התקנה מקצועית',
    'services.wrapping_cta': 'צפה בגלריה',

    // Gallery/Wrapping Page
    'gallery.title': 'עיטוף רכבים מקצועי',
    'gallery.subtitle': 'שנה את הרכב שלך עם סרטי רכב מתקדמים. משינויי צבע מלאים לפתרונות הגנה, אנו מספקים תוצאות יוצאות דופן עם חומרים מובילים בתעשייה.',
    'gallery.services_title': 'שירותי העיטוף שלנו',
    'gallery.services_subtitle': 'צור איתנו קשר לדיון על הצרכים שלך ממגוון שירותי עיטוף רכבים וניקיון מקצועיים',
    'gallery.professional_title': 'שירותי רכב מקצועיים',
    'gallery.professional_description': 'אנו מציעים מגוון מקיף של שירותי עיטוף רכבים וניקיון. צור איתנו קשר לדיון על השירות המתאים ביותר לצרכים ולתקציב שלך.',
    'gallery.wrapping_services': 'שירותי עיטוף',
    'gallery.additional_services': 'שירותים נוספים',
    'gallery.why_choose': 'למה לבחור בשירותים שלנו?',
    'gallery.premium_materials': 'חומרים מתקדמים',
    'gallery.premium_materials_desc': 'סרטי רכב מובילים בתעשייה',
    'gallery.expert_installation': 'התקנה מקצועית',
    'gallery.expert_installation_desc': 'טכנאים מקצועיים מוסמכים',
    'gallery.quality_guarantee': 'ערבות איכות',
    'gallery.quality_guarantee_desc': 'ערבות על כל השירותים',
    'gallery.contact_quote': 'מוכן לשנות את הרכב שלך? צור איתנו קשר לדיון על הפרויקט שלך ולקבלת הצעת מחיר מותאמת אישית.',
    'gallery.contact_for_quote': 'צור קשר להצעת מחיר',
    'gallery.request_consultation': 'בקש ייעוץ',

    // Courses Page
    'courses.title': 'הסמכת Koch Chemie מקצועית',
    'courses.subtitle': 'השלט בטכניקות ניקיון והברקה בתוכנית ההסמכה המקיפה שלנו למשך 4 ימים, הנלמדת לפי הסטנדרטים והמתודולוגיות הנודעות של Koch Chemie.',
    'courses.intro_title': 'מבוא לקורס',
    'courses.intro_subtitle': 'צפו בהסבר המפורט שלנו על מה שתלמדו בקורס ההסמכה הזה',
    'courses.course_title': 'קורס הסמכת ניקיון והברקה',
    'courses.course_description': 'התוכנית המקיפה שלנו למשך 4 ימים משלבת למידה אינטראקטיבית עם הכשרה מעשית, ומגיעה לשיא בהסמכת Koch Chemie רשמית המוכרת בכל התעשייה.',
    'courses.what_learn': 'מה תלמדו',
    'courses.course_structure': 'מבנה הקורס למשך 4 ימים',
    'courses.why_choose': 'למה לבחור בהסמכת Koch Chemie שלנו?',
    'courses.enroll_now': 'הירשם עכשיו',
    'courses.contact_details': 'צור קשר לפרטים',
    
    // Common
    'common.learn_more': 'למד עוד',
    'common.contact_us': 'צור קשר',
    'common.get_started': 'התחל',
    'common.search': 'חיפוש',
    'common.professional_training': 'הכשרה מקצועית',
    'common.mt_wraps_services': 'שירותי MT Wraps',
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