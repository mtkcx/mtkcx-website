import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Menu, X, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
const Header = () => {
  const navigate = useNavigate();
  const {
    currentLanguage,
    setLanguage,
    t,
    isRTL
  } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const languages: {
    code: Language;
    name: string;
    flag: string;
  }[] = [{
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }, {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦'
  }, {
    code: 'he',
    name: 'עברית',
    flag: '🇮🇱'
  }];
  const navigationItems = [{
    key: 'nav.home',
    href: '/'
  }, {
    key: 'nav.products',
    href: '/products'
  }, {
    key: 'nav.courses',
    href: '/courses'
  }, {
    key: 'nav.wrapping',
    href: '/gallery'
  }, {
    key: 'nav.about',
    href: '/about'
  }, {
    key: 'nav.contact',
    href: '/contact'
  }];
  return <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95 w-full">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link to="/">
              <img src="/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png" alt="MT KCx Logo" className="h-40 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center space-x-4">
              {navigationItems.map(item => <Link 
                key={item.key} 
                to={item.href} 
                className="text-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-md hover:bg-primary/5"
              >
                {t(item.key)}
              </Link>)}
            </div>
          </nav>

          {/* Search & Language Selector - Right */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button variant="ghost" size="lg" className="flex items-center space-x-2 px-4 py-2">
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">{t('common.search')}</span>
            </Button>

            {/* Language Dropdown - Bigger */}
            <div className="relative group">
              <Button variant="ghost" size="lg" className="flex items-center space-x-3 px-4 py-2 min-w-[120px]">
                <Globe className="h-5 w-5" />
                <span className="flex items-center space-x-2">
                  <span className="text-lg">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                  <span className="hidden sm:inline font-medium">
                    {languages.find(lang => lang.code === currentLanguage)?.name}
                  </span>
                </span>
              </Button>
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px] z-50">
                {languages.map(lang => <button 
                  key={lang.code} 
                  onClick={() => setLanguage(lang.code)} 
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center space-x-3 ${currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>)}
              </div>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="lg" className="px-3 py-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map(item => <Link 
                    key={item.key} 
                    to={item.href} 
                    className="text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t(item.key)}
                  </Link>)}
                  
                  {/* Mobile Search */}
                  <Button variant="ghost" className="justify-start py-3 px-2 border-b border-border">
                    <Search className="h-5 w-5 mr-3" />
                    {t('common.search')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;