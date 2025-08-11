import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileServiceCalculator } from '@/components/mobile/MobileServiceCalculator';
import { MobileProductCatalog } from '@/components/mobile/MobileProductCatalog';
import { MobileDashboard } from '@/components/mobile/MobileDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calculator, 
  ShoppingBag, 
  User, 
  Home,
  Camera,
  BookOpen
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import CartButton from '@/components/CartButton';

const MobileApp: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

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

  return (
    <>
      <SEOHead 
        title="MT Wraps Mobile App - Vehicle Wrapping & Koch-Chemie Products"
        description="Access MT Wraps services on mobile. Calculate wrapping costs, browse Koch-Chemie products, track orders, and enroll in detailing courses."
        keywords="mobile app, vehicle wrapping, koch chemie mobile, car detailing app, wrapping calculator"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MT</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">MT Wraps</h1>
                <p className="text-xs text-muted-foreground">Professional Vehicle Wrapping</p>
              </div>
            </div>
            <CartButton />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={user ? "dashboard" : "calculator"} className="w-full">
          <div className="pb-20">
            <TabsContent value="dashboard" className="m-0">
              {user ? (
                <MobileDashboard />
              ) : (
                <div className="p-4 text-center space-y-4">
                  <h2 className="text-xl font-semibold">Sign in to access your dashboard</h2>
                  <p className="text-muted-foreground">
                    Track your orders, manage enrollments, and access exclusive features
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calculator" className="m-0">
              <MobileServiceCalculator />
            </TabsContent>

            <TabsContent value="products" className="m-0 p-4">
              <MobileProductCatalog />
            </TabsContent>

            <TabsContent value="courses" className="m-0 p-4">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <BookOpen className="h-12 w-12 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold">Professional Training</h2>
                  <p className="text-muted-foreground">
                    Master vehicle wrapping and detailing techniques
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Professional Detailing Course</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Learn advanced detailing techniques using Koch-Chemie products
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">$299</span>
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
                        Enroll Now
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-50/25 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Vehicle Wrapping Fundamentals</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Master the basics of professional vehicle wrapping
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600">$499</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                        Enroll Now
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-50/25 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Advanced Wrapping Techniques</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complex curves, commercial wraps, and business setup
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600">$799</span>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm">
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="m-0 p-4">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold">Get Instant Quote</h2>
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
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
            <TabsList className="grid w-full grid-cols-5 bg-transparent h-16 rounded-none">
              <TabsTrigger 
                value="dashboard" 
                className="flex-col gap-1 data-[state=active]:bg-primary/10"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="calculator" 
                className="flex-col gap-1 data-[state=active]:bg-primary/10"
              >
                <Calculator className="h-5 w-5" />
                <span className="text-xs">Calculate</span>
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
                <span className="text-xs">Products</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="courses" 
                className="flex-col gap-1 data-[state=active]:bg-primary/10"
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Courses</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default MobileApp;