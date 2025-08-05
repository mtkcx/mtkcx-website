import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const Header = () => {
  const { currentLanguage, setLanguage, t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
  ];

  const navigationItems = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.products', href: '/products' },
    { key: 'nav.courses', href: '/courses' },
    { key: 'nav.wrapping', href: '/wrapping' },
    { key: 'nav.about', href: '/about' },
    { key: 'nav.contact', href: '/contact' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png" 
              alt="MT KCx Logo" 
              className="h-24 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          {/* Language Selector & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Dropdown */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
              </Button>
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px] z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md flex items-center space-x-2 ${
                      currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      className="text-foreground hover:text-primary transition-colors font-medium py-2 border-b border-border"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(item.key)}
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;