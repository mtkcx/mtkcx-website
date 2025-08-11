import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Award, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  Palette
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const MobileHome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          Welcome to MTKCx
        </h1>
        <p className="text-lg text-muted-foreground">
          Your Premier Vehicle Wrapping & Detailing Specialists
        </p>
      </div>

      {/* Hero Image */}
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <img
            src="/lovable-uploads/30e3c614-7f57-4a20-ac67-247493252428.png"
            alt="Professional vehicle wrapping showcase"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="font-bold text-xl mb-2">Professional Excellence</h2>
            <p className="text-sm opacity-90">
              Transforming vehicles with precision and style
            </p>
          </div>
        </div>
      </Card>

      {/* About Us */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">Who We Are</h2>
        <p className="text-muted-foreground leading-relaxed">
          MTKCx stands as Jerusalem's premier destination for automotive excellence, specializing in advanced paint protection films, 
          custom vehicle wraps, and professional detailing services. As an official Koch-Chemie partner, we combine years of expertise 
          with cutting-edge techniques and premium materials to transform and protect vehicles while maintaining the highest standards of quality and precision.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">250+</div>
            <p className="text-sm text-muted-foreground">Premium Products</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">1000+</div>
            <p className="text-sm text-muted-foreground">Satisfied Customers</p>
          </div>
        </div>
      </Card>

      {/* Our Services */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">What We Offer</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Koch-Chemie Premium Products</h3>
              <p className="text-sm text-muted-foreground">
                Official distributor of Koch-Chemie's complete professional range including polishes, waxes, ceramic coatings, and detailing tools.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Palette className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Professional Vehicle Wrapping</h3>
              <p className="text-sm text-muted-foreground">
                Custom vehicle wraps, paint protection film installation, and commercial fleet branding with premium materials and expert craftsmanship.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Professional Training & Education</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive Koch-Chemie certification courses, hands-on training workshops, and professional development programs.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Gallery */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Our Work</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/36a5b06f-591b-4391-afb4-afc8339e30d0.png"
              alt="Ferrari vehicle wrap project"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/958f8b61-60b5-4d04-a76e-918b20e5f00e.png"
              alt="BMW M5 custom wrap design"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/21ac7e3a-0b5f-4f29-82e3-585d03ee269e.png"
              alt="Luxury boat interior detailing"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/22562b53-7b93-496f-9407-a2e6053a37b5.png"
              alt="Mercedes AMG with racing stripe wrap"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Card>

      {/* Why Choose MT KCx */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Why Choose MTKCx?</h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Official Koch-Chemie partnership and certification</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Premium German-engineered products and materials</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Comprehensive warranties on all services</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Professional training and certification programs</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Expert installation and personalized service</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Competitive pricing with transparent costs in NIS</span>
          </div>
        </div>
      </Card>

      {/* Visit Our Facility */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Visit Our Facility</h2>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">Atarot Industrial Zone, Jerusalem</p>
          </div>
          
          <div>
            <h3 className="font-semibold">What We Do</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">Koch-Chemie Products</Badge>
              <Badge variant="secondary">Vehicle Wrapping Services</Badge>
              <Badge variant="secondary">Professional Training</Badge>
              <Badge variant="secondary">Paint Protection Film</Badge>
              <Badge variant="secondary">Certification Courses</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold">Established</h3>
            <p className="text-sm text-muted-foreground">Founded in 2020, serving Jerusalem with excellence</p>
          </div>
        </div>
      </Card>

      {/* User-specific content */}
      {user && (
        <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Welcome back!</h3>
            <p className="text-sm text-muted-foreground">
              Ready to explore our latest services and products?
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};