import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Menu, X, Search, User, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CartButton from '@/components/CartButton';
const Header = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isAdmin,
    signOut
  } = useAuth();
  const {
    currentLanguage,
    setLanguage,
    t,
    isRTL
  } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-dropdown]')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isLanguageDropdownOpen]);

  const handleLanguageDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };
  const languages = [{
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
  }] as const;
  const navigationItems = [{
    key: 'nav.home',
    href: '/'
  }, {
    key: 'nav.products',
    href: '/products'
  }, {
    key: 'nav.courses',
    href: '/courses'
  }, 
  // Temporarily hidden - will be used later
  // {
  //   key: 'nav.wrapping',
  //   href: '/gallery'
  // }, 
  {
    key: 'nav.about',
    href: '/about'
  }, {
    key: 'nav.contact',
    href: '/contact'
  }];
  return <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full px-4 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png" 
                alt="MT KCx Logo" 
                className="h-24 sm:h-32 md:h-36 lg:h-40 w-auto gpu-accelerated"
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center space-x-4">
              {navigationItems.map(item => <Link key={item.key} to={item.href} className="text-foreground hover:text-primary transition-colors font-medium py-2 rounded-md hover:bg-primary/5 px-3 whitespace-nowrap" onClick={() => window.scrollTo(0, 0)}>
                {t(item.key)}
              </Link>)}
            </div>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cart Button */}
            <CartButton />
            
            {/* Authentication Controls */}
            {user ? <div className="relative group">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 px-2 sm:px-4 py-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">
                    {profile?.full_name || user.email?.split('@')[0] || 'Account'}
                  </span>
                </Button>
                <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px] z-50">
                  {isAdmin ? (
                    <Link to="/dashboard" className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg" onClick={() => window.scrollTo(0, 0)}>
                      <Settings className="w-4 h-4 mr-3" />
                      {t('auth.admin_dashboard')}
                    </Link>
                  ) : (
                    <Link to="/profile" className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg" onClick={() => window.scrollTo(0, 0)}>
                      <User className="w-4 h-4 mr-3" />
                      {t('auth.my_profile')}
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/my-orders" className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors" onClick={() => window.scrollTo(0, 0)}>
                      <ShoppingBag className="w-4 h-4 mr-3" />
                      My Orders
                    </Link>
                  )}
                  <button onClick={signOut} className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors last:rounded-b-lg">
                    <LogOut className="w-4 h-4 mr-3" />
                    {t('auth.sign_out')}
                  </button>
                </div>
              </div> : <Button variant="ghost" size="lg" onClick={() => { navigate('/auth'); window.scrollTo(0, 0); }} className="flex items-center space-x-2 px-2 sm:px-4 py-2">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">{t('auth.sign_in')}</span>
              </Button>}

            {/* Search Button */}
            <Button variant="ghost" size="lg" className="flex items-center space-x-2 px-2 sm:px-4 py-2">
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">{t('common.search')}</span>
            </Button>

            {/* Language Dropdown */}
            <div 
              className="relative" 
              data-language-dropdown
              {...(isMobile ? {
                onClick: handleLanguageDropdownToggle
              } : {
                onMouseEnter: () => setIsLanguageDropdownOpen(true),
                onMouseLeave: () => setIsLanguageDropdownOpen(false)
              })}
            >
              <Button 
                variant="ghost" 
                size="lg" 
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 min-w-[100px] sm:min-w-[120px]"
                {...(isMobile ? { onClick: handleLanguageDropdownToggle } : {})}
              >
                <Globe className="h-5 w-5" />
                <span className="flex items-center space-x-2">
                  <span className="text-lg">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                  <span className="hidden sm:inline font-medium text-sm">
                    {languages.find(lang => lang.code === currentLanguage)?.name}
                  </span>
                </span>
              </Button>
              <div className={`absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg transition-all duration-200 min-w-[160px] z-50 ${
                isLanguageDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}>
                 {languages.map(lang => 
                  <button 
                    key={lang.code} 
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLanguageDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center space-x-3 ${
                      currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                )}
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
                  {navigationItems.map(item => <Link key={item.key} to={item.href} className="text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}>
                      {t(item.key)}
                    </Link>)}
                  
                  {/* Mobile Auth */}
                  {user ? <>
                      <Link to="/dashboard" className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}>
                        <User className="h-5 w-5 mr-3" />
                        {t('auth.dashboard')}
                      </Link>
                      <button onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }} className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border w-full text-left">
                        <LogOut className="h-5 w-5 mr-3" />
                        {t('auth.sign_out')}
                      </button>
                    </> : <Button variant="ghost" onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/auth');
                  window.scrollTo(0, 0);
                }} className="justify-start py-3 px-2 border-b border-border">
                      <User className="h-5 w-5 mr-3" />
                      {t('auth.sign_in')}
                    </Button>}
                  
                  {/* Mobile Search */}
                  <Button variant="ghost" className="justify-start py-3 px-2 border-b border-border">
                    <Search className="h-5 w-5 mr-3" />
                    {t('common.search')}
                  </Button>
                  
                  {/* Mobile Language Selector */}
                  <div className="py-3 px-2 border-b border-border">
                    <div className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <Globe className="h-5 w-5 mr-3" />
                      {t('common.language')}
                    </div>
                    <div className="space-y-2">
                      {languages.map(lang => (
                        <button 
                          key={lang.code} 
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} 
                          className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-md flex items-center space-x-3 ${
                            currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;