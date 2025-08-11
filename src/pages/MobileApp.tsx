import React, { useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calculator, 
  ShoppingBag, 
  User, 
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
  Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import CartButton from '@/components/CartButton';
import { useNavigate } from 'react-router-dom';

const MobileApp: React.FC = () => {
  const { user, signOut } = useAuth();
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

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
    setIsMenuOpen(false);
  };

  const handleShowContact = () => {
    setShowContact(true);
    setIsMenuOpen(false);
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setIsMenuOpen(false);
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
    // Scroll to top when changing tabs
    window.scrollTo(0, 0);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'en' | 'ar' | 'he');
  };

  // Redirect desktop users
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Mobile App View</h1>
          <p className="text-muted-foreground">
            This is a preview of the mobile app interface. 
            For the best experience, visit this page on a mobile device or use your browser's mobile view.
          </p>
        </div>
      </div>
    );
  }

  // Show auth screen
  if (showAuth) {
    return <MobileAuth onBack={() => setShowAuth(false)} />;
  }

  // Show contact screen
  if (showContact) {
    return <MobileContact onBack={() => setShowContact(false)} />;
  }

  // Show about screen
  if (showAbout) {
    return <MobileAbout onBack={() => setShowAbout(false)} />;
  }

  const menuItems = [
    { icon: Home, label: t('nav.home'), action: () => handleTabSwitch('home') },
    { icon: Calculator, label: 'Packages', action: () => handleTabSwitch('calculator') },
    { icon: Camera, label: 'Get Quote', action: () => handleTabSwitch('photo') },
    { icon: ShoppingBag, label: t('nav.products'), action: () => handleTabSwitch('products') },
    { icon: BookOpen, label: t('nav.courses'), action: () => handleTabSwitch('courses') },
    { icon: Phone, label: t('nav.contact'), action: handleShowContact },
    { icon: MapPin, label: t('nav.about'), action: handleShowAbout },
    ...(user ? [{ icon: Shield, label: 'Admin Dashboard', action: () => handleTabSwitch('dashboard') }] : []),
  ];

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
                      alt="MT KCx Logo" 
                      className="h-8 w-auto"
                    />
                    Menu
                  </SheetTitle>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  {/* Language Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Language</span>
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
              alt="MT KCx Logo" 
              className="h-16 w-auto cursor-pointer"
              onClick={() => {
                setActiveTab('home');
                window.scrollTo(0, 0);
              }}
            />

            {/* Cart Button */}
            <div className="relative">
              <CartButton />
            </div>
          </div>
        </div>

        {/* Conditional Checkout View */}
        {showCheckout ? (
          <MobileCheckout
            onBack={() => setShowCheckout(false)}
            onPaymentSuccess={() => {
              setShowCheckout(false);
              setActiveTab('home');
            }}
          />
        ) : (
          /* Main Content */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

              <TabsContent value="courses" className="m-0 p-4">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <BookOpen className="h-12 w-12 text-primary mx-auto" />
                    <h2 className="text-2xl font-bold">{t('courses.title')}</h2>
                    <p className="text-muted-foreground">
                      {t('courses.subtitle')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src="/lovable-uploads/30e3c614-7f57-4a20-ac67-247493252428.png"
                          alt="Professional car detailing training session"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-bold text-xl">{t('courses.course_title')}</h3>
                          <p className="text-white/90 text-sm">{t('courses.four_days')} {t('courses.interactive_format')}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{t('courses.what_learn')}</h4>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t('courses.professional_techniques')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t('courses.advanced_polishing')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t('courses.product_knowledge')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t('courses.surface_assessment')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t('courses.machine_polishing')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t('courses.business_practices')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">{t('courses.course_duration')}:</span>
                            <div className="font-semibold">{t('courses.four_days')}</div>
                          </div>
                          <div>
                            <span className="font-medium">{t('courses.training_format')}:</span>
                            <div className="font-semibold">{t('courses.interactive_format')}</div>
                          </div>
                          <div>
                            <span className="font-medium">{t('courses.class_size')}:</span>
                            <div className="font-semibold">{t('courses.small_groups')}</div>
                          </div>
                          <div>
                            <span className="font-medium">{t('courses.location')}:</span>
                            <div className="font-semibold">{t('courses.atarot_location')}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold">{t('courses.course_includes')}:</h4>
                          <div className="grid grid-cols-1 gap-1 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Professional Koch-Chemie product kit</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Equipment and tools access</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Training materials and manual</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Official certification upon completion</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Lunch and refreshments included</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Post-course support and guidance</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">{t('courses.contact_pricing')}</span>
                            <div className="font-bold text-primary text-lg">{t('courses.professional_certification')}</div>
                          </div>
                          <Button 
                            className="bg-primary text-primary-foreground"
                            onClick={() => setIsEnrollmentDialogOpen(true)}
                          >
                            {t('courses.enroll_now')}
                          </Button>
                        </div>
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
                      Take photos of your vehicle for an accurate quote
                    </p>
                  </div>

                  {/* This would integrate with MobilePhotoUpload */}
                  <div className="bg-primary/5 p-6 rounded-lg border-2 border-dashed border-primary/20 text-center">
                    <Camera className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Start Photo Session</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll guide you through taking the right photos
                    </p>
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md">
                      Open Camera
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">&lt; 5 min</div>
                      <div className="text-sm text-muted-foreground">Quick process</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">24h</div>
                      <div className="text-sm text-muted-foreground">Response time</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <TabsList className={`grid w-full ${user ? 'grid-cols-6' : 'grid-cols-5'} bg-transparent h-16 rounded-none`}>
                <TabsTrigger 
                  value="home" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10"
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs">{t('nav.home')}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="calculator" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="text-xs">Packages</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="photo" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Quote</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="products" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-xs">{t('nav.products')}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="courses" 
                  className="flex-col gap-1 data-[state=active]:bg-primary/10"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs">{t('nav.courses')}</span>
                </TabsTrigger>
                
                {user && (
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex-col gap-1 data-[state=active]:bg-primary/10"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="text-xs">Admin</span>
                  </TabsTrigger>
                )}
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