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
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <div className="flex items-center justify-center p-4">
            <img 
              src="/lovable-uploads/93339d8c-e8b6-44d4-a598-f792a3019f2d.png" 
              alt="MTKCX Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Cart Button - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <CartButton />
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
                    Master professional car detailing with Koch-Chemie certification
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
                        <h3 className="font-bold text-xl">Koch-Chemie Professional Detailing Course</h3>
                        <p className="text-white/90 text-sm">4-day intensive certification program</p>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">What You'll Learn:</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Professional detailing techniques</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Advanced polishing and correction</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Complete Koch-Chemie product knowledge</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Surface assessment and treatment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Machine polishing mastery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Quality control and business practices</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <div className="font-semibold">4 Days</div>
                        </div>
                        <div>
                          <span className="font-medium">Format:</span>
                          <div className="font-semibold">Hands-on</div>
                        </div>
                        <div>
                          <span className="font-medium">Group Size:</span>
                          <div className="font-semibold">Small Groups</div>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <div className="font-semibold">Atarot, Jerusalem</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Course Includes:</h4>
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
                          <span className="text-sm text-muted-foreground">Contact for pricing</span>
                          <div className="font-bold text-primary text-lg">Professional Course</div>
                        </div>
                        <Button className="bg-primary text-primary-foreground">
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  </Card>
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