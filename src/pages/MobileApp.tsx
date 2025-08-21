import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileServiceCalculator } from '@/components/mobile/MobileServiceCalculator';
import { MobileProductCatalog } from '@/components/mobile/MobileProductCatalog';
import { MobileHome } from '@/components/mobile/MobileHome';
import { MobileCheckout } from '@/components/mobile/MobileCheckout';
import { MobileDashboard } from '@/components/mobile/MobileDashboard';
import { MobileEnrollmentDialog } from '@/components/mobile/MobileEnrollmentDialog';
import { MobileAuth } from '@/components/mobile/MobileAuth';
import { MobileContact } from '@/components/mobile/MobileContact';
import { MobileAbout } from '@/components/mobile/MobileAbout';
import { MobilePWAFeatures } from '@/components/mobile/MobilePWAFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  ShoppingBag, 
  User as UserIcon, 
  Home,
  Camera,
  BookOpen,
  CheckCircle,
  Menu,
  LogIn,
  LogOut,
  UserCircle,
  Quote,
  Settings,
  Phone,
  Mail,
  MapPin,
  Shield,
  Globe,
  MessageCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import CartButton from '@/components/CartButton';

const MobileApp: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { currentLanguage, setLanguage, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Handle navigation events from home page
  useEffect(() => {
    const handleNavigateToProducts = (event: CustomEvent) => {
      setActiveTab('products');
      // Pass category to products component via event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('set-product-category', { 
          detail: { category: event.detail.category } 
        }));
      }, 100);
    };

    const handleMobileCheckout = () => {
      setShowCheckout(true);
    };

    window.addEventListener('navigate-to-products', handleNavigateToProducts as EventListener);
    window.addEventListener('mobile-checkout-open', handleMobileCheckout);
    
    return () => {
      window.removeEventListener('navigate-to-products', handleNavigateToProducts as EventListener);
      window.removeEventListener('mobile-checkout-open', handleMobileCheckout);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
    setIsMenuOpen(false);
    // Scroll to top when opening auth
    window.scrollTo(0, 0);
  };

  const handleShowContact = () => {
    setShowContact(true);
    setShowAbout(false); // Clear about state
    setIsMenuOpen(false);
    // Scroll to top when opening contact
    window.scrollTo(0, 0);
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setShowContact(false); // Clear contact state
    setIsMenuOpen(false);
    // Scroll to top when opening about
    window.scrollTo(0, 0);
  };

  const handleTabSwitch = (tab: string) => {
    // Clear filters when switching to products tab
    if (tab === 'products') {
      window.dispatchEvent(new CustomEvent('clear-product-filters'));
    }
    
    setActiveTab(tab);
    setIsMenuOpen(false);
    setShowAuth(false);
    setShowContact(false);
    setShowAbout(false);
    setShowCheckout(false);
    // Clear product filters when switching tabs
    if (tab !== 'products') {
      window.dispatchEvent(new CustomEvent('clear-product-filters'));
    }
    // Scroll to top when changing tabs
    window.scrollTo(0, 0);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'en' | 'ar' | 'he');
  };

  // Handle admin dashboard navigation
  const handleAdminDashboard = () => {
    // Navigate to mobile admin route
    navigate('/mobile-admin');
    setIsMenuOpen(false);
  };

  const menuItems = [
    { 
      icon: Home, 
      label: t('nav.home'), 
      action: () => {
        setActiveTab('home');
        setShowAuth(false);
        setShowContact(false);
        setShowAbout(false);
        setShowCheckout(false);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
      }
    },
    { 
      icon: ShoppingBag, 
      label: t('nav.products'), 
      action: () => {
        setActiveTab('products');
        setShowAuth(false);
        setShowContact(false);
        setShowAbout(false);
        setShowCheckout(false);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
      }
    },
    { 
      icon: BookOpen, 
      label: t('nav.courses'), 
      action: () => {
        setActiveTab('courses');
        setShowAuth(false);
        setShowContact(false);
        setShowAbout(false);
        setShowCheckout(false);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
      }
    },
    { 
      icon: Phone, 
      label: t('nav.contact'), 
      action: () => {
        handleShowContact();
      }
    },
    { 
      icon: MapPin, 
      label: t('nav.about'), 
      action: () => {
        handleShowAbout();
      }
    },
    ...(user ? [
      { icon: Shield, label: t('mobile.nav.dashboard'), action: () => handleTabSwitch('dashboard') },
      ...(isAdmin ? [{ icon: Shield, label: t('mobile.nav.admin'), action: handleAdminDashboard }] : [])
    ] : []),
  ];

  // Show auth screen
  if (showAuth) {
    return <MobileAuth onBack={() => setShowAuth(false)} />;
  }

  // Show contact screen
  if (showContact) {
    return <MobileContact 
      onBack={() => setShowContact(false)}
      onTabSwitch={handleTabSwitch}
      onShowAbout={handleShowAbout}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      currentLanguage={currentLanguage}
      handleLanguageChange={handleLanguageChange}
      menuItems={menuItems}
    />;
  }

  // Show about screen
  if (showAbout) {
    return <MobileAbout 
      onBack={() => setShowAbout(false)}
      onTabSwitch={handleTabSwitch}
      onShowContact={handleShowContact}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      currentLanguage={currentLanguage}
      handleLanguageChange={handleLanguageChange}
      menuItems={menuItems}
    />;
  }

  return (
    <>
      <SEOHead 
        title="MT Wraps Mobile App - Vehicle Wrapping & Koch-Chemie Products"
        description="Access MT Wraps services on mobile. Calculate wrapping costs, browse Koch-Chemie products, track orders, and enroll in detailing courses."
        keywords="mobile app, vehicle wrapping, koch chemie mobile, car detailing app, wrapping calculator"
      />
      
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header with Menu */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between p-4">
            {/* Hamburger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img 
                      src="/lovable-uploads/d780ca10-1c5a-4f83-bbf2-ff0e6949ad40.png" 
                      alt="MTKCx Logo"
                      className="h-12 w-auto"
                    />
                    {t('common.menu')}
                  </SheetTitle>
                </SheetHeader>
                
            <div className="space-y-4 mt-6">
              {/* PWA Features */}
              <MobilePWAFeatures />

              {/* Language Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t('common.language')}</span>
                </div>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="he">עברית</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

                  {/* User Section */}
                  {user ? (
                    <Card className="p-4 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-semibold">{t('dashboard.welcome')}!</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-4">
                      <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {t('auth.signin_to_request_quote')}
                        </p>
                        <Button 
                          onClick={handleShowAuth}
                          className="w-full"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          {t('auth.sign_in')}
                        </Button>
                      </div>
                    </Card>
                  )}

                  <Separator />

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {menuItems.map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={item.action}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {user && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleShowAuth()}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          {t('dashboard.edit_profile')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t('auth.sign_out')}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Clickable */}
            <img 
              src="/lovable-uploads/d780ca10-1c5a-4f83-bbf2-ff0e6949ad40.png" 
              alt="MTKCx Logo" 
              className="h-20 w-auto cursor-pointer"
            onClick={() => {
              setActiveTab('home');
              setShowAuth(false);
              setShowContact(false);
              setShowAbout(false);
              setShowCheckout(false);
              window.scrollTo(0, 0);
            }}
            />

            {/* Right Side - Language Selector and Cart */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="ar">AR</SelectItem>
                  <SelectItem value="he">HE</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Cart Button */}
              <CartButton />
            </div>
          </div>
        </div>

        {/* Conditional Checkout View */}
        {showCheckout ? (
          <MobileCheckout
            onBack={() => setShowCheckout(false)}
          />
        ) : (
          /* Main Content */
          <Tabs value={activeTab} onValueChange={handleTabSwitch} className="w-full">
            <div className="pb-20">
              <TabsContent value="home" className="m-0">
                <MobileHome />
              </TabsContent>

              <TabsContent value="calculator" className="m-0">
                <MobileServiceCalculator />
              </TabsContent>

              <TabsContent value="products" className="m-0 p-4">
                <MobileProductCatalog onCheckout={() => setShowCheckout(true)} />
              </TabsContent>

              <TabsContent value="courses" className="m-0 p-4 pb-24">
                <div className="space-y-8">
                  <div className="text-center space-y-6">
                    <h2 className={`text-2xl sm:text-3xl font-bold px-4 ${isRTL ? 'leading-[1.6] tracking-wide' : 'leading-tight'} max-w-sm mx-auto`}>
                      {t('courses.title')}
                    </h2>
                    <p className={`text-muted-foreground text-base sm:text-lg ${isRTL ? 'leading-[1.8] tracking-wide px-2' : 'leading-relaxed'} max-w-md mx-auto`}>
                      {t('courses.subtitle')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <Card className="overflow-hidden shadow-lg">
                      <div className="relative h-56">
                        <img
                          src="/lovable-uploads/30e3c614-7f57-4a20-ac67-247493252428.png"
                          alt="Professional car detailing training session"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="font-bold text-2xl mb-2">{t('courses.course_title')}</h3>
                          <p className="text-white/90 text-base">{t('courses.four_days')} • {t('courses.interactive_format')}</p>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-bold text-lg text-primary">{t('courses.what_learn')}</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('courses.professional_techniques')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('courses.advanced_polishing')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('courses.product_knowledge')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('courses.surface_assessment')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('courses.machine_polishing')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('courses.business_practices')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-5 rounded-lg">
                          <h4 className="font-bold text-lg mb-4 text-primary">{t('mobile.courses.course_details')}</h4>
                          <div className="space-y-4">
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-base">{t('courses.course_duration')}:</span>
                              <span className="font-semibold text-primary text-lg">{t('courses.four_days')}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-base">{t('courses.training_format')}:</span>
                              <span className="font-semibold text-primary text-lg">{t('courses.interactive_format')}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-base">{t('courses.class_size')}:</span>
                              <span className="font-semibold text-primary text-lg">{t('courses.small_groups')}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="font-medium text-base">{t('courses.location')}:</span>
                              <span className="font-semibold text-primary text-lg leading-relaxed">{t('courses.atarot_location')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold text-lg text-primary">{t('courses.course_includes')}:</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('mobile.courses.product_kit')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('mobile.courses.equipment_access')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('mobile.courses.training_materials')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('mobile.courses.official_certification')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('mobile.courses.lunch_included')}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-base">{t('mobile.courses.ongoing_support')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                          <div className="text-center space-y-3">
                            <div className="text-base text-muted-foreground">{t('courses.contact_pricing')}</div>
                            <div className="font-bold text-primary text-2xl leading-relaxed">
                              {t('courses.professional_certification')}
                            </div>
                            <div className="text-base text-muted-foreground leading-relaxed">
                              {t('courses.interactive_hands_on')}
                            </div>
                          </div>
                        </div>

                        <Button 
                          className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => setIsEnrollmentDialogOpen(true)}
                        >
                          <BookOpen className="h-5 w-5 mr-2" />
                          {t('courses.enroll_now')}
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {user && (
                <TabsContent value="dashboard" className="m-0">
                  <MobileDashboard />
                </TabsContent>
              )}

              <TabsContent value="photo" className="m-0 p-4">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <Camera className="h-12 w-12 text-primary mx-auto" />
                    <h2 className="text-2xl font-bold">{t('quote.request_title')}</h2>
                    <p className="text-muted-foreground">
                      {t('quote.photo_instructions')}
                    </p>
                  </div>

                  {/* This would integrate with MobilePhotoUpload */}
                  <div className="bg-primary/5 p-6 rounded-lg border-2 border-dashed border-primary/20 text-center">
                    <Camera className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{t('quote.start_photo_session')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('quote.photo_guide')}
                    </p>
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md">
                      {t('quote.open_camera')}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">&lt; 5 min</div>
                      <div className="text-sm text-muted-foreground">{t('quote.quick_process')}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">24h</div>
                      <div className="text-sm text-muted-foreground">{t('quote.response_time')}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            <div className={`fixed bottom-0 left-0 right-0 bg-background border-t ${isRTL ? 'rtl' : 'ltr'}`} style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <TabsList className="grid w-full grid-cols-5 bg-transparent h-16 rounded-none" dir={isRTL ? 'rtl' : 'ltr'}>
                <TabsTrigger 
                  value="home" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10 min-h-[64px]"
                >
                  <Home className="h-5 w-5 flex-shrink-0" />
                  <span className="text-[10px] leading-tight px-1">{t('nav.home')}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="products" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10 min-h-[64px]"
                >
                  <ShoppingBag className="h-5 w-5 flex-shrink-0" />
                  <span className="text-[10px] leading-tight px-1">{t('nav.products')}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="courses" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10 min-h-[64px]"
                >
                  <BookOpen className="h-5 w-5 flex-shrink-0" />
                  <span className="text-[10px] leading-tight px-1">{t('nav.courses')}</span>
                </TabsTrigger>
                
                <Button
                  variant="ghost"
                  className="flex-col gap-1 h-16 rounded-none min-h-[64px]"
                  onClick={handleShowContact}
                >
                  <MessageCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-[10px] leading-tight px-1">{t('nav.contact')}</span>
                </Button>
                
                <TabsTrigger 
                  value="dashboard" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10 min-h-[64px]"
                >
                  <UserIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-xs truncate max-w-full px-1 leading-tight">
                    {profile?.full_name || user?.email?.split('@')[0] || t('nav.profile')}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enrollment Dialog */}
            <MobileEnrollmentDialog
              isOpen={isEnrollmentDialogOpen}
              onClose={() => setIsEnrollmentDialogOpen(false)}
            />
          </Tabs>
        )}
      </div>
    </>
  );
};

export default MobileApp;
