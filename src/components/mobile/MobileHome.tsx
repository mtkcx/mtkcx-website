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
          Welcome to MT KCx
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
          MT KCx is Israel's leading vehicle wrapping and detailing company, specializing in premium paint protection films, 
          custom wraps, and professional detailing services. With years of experience and cutting-edge techniques, 
          we transform and protect vehicles while maintaining the highest standards of quality.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">500+</div>
            <p className="text-sm text-muted-foreground">Vehicles Wrapped</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">5+</div>
            <p className="text-sm text-muted-foreground">Years Experience</p>
          </div>
        </div>
      </Card>

      {/* Our Services */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Our Services</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Paint Protection Film</h3>
              <p className="text-sm text-muted-foreground">
                Premium PPF installation to protect your vehicle's paint from scratches, chips, and environmental damage.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Palette className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Custom Vehicle Wraps</h3>
              <p className="text-sm text-muted-foreground">
                Complete color changes, custom designs, and commercial branding solutions.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">Professional Detailing</h3>
              <p className="text-sm text-muted-foreground">
                Koch-Chemie certified detailing services and training courses.
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
              src="/lovable-uploads/3df6143b-1e24-4063-ac21-1f8d68e1c558.png"
              alt="Vehicle wrapping project"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/467c4fc8-85d3-4b19-a924-11162bf078e7.png"
              alt="Custom wrap design"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/3d7dc22e-86ff-41c1-be13-22c68e59c932.png"
              alt="Professional detailing"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src="/lovable-uploads/027350b0-6659-443a-bf00-5ce996bb68be.png"
              alt="Paint protection film"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Card>

      {/* Why Choose Us */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Why Choose MT KCx?</h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Koch-Chemie certified professionals</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Premium materials and equipment</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Comprehensive warranties</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Personalized customer service</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Competitive pricing in NIS</span>
          </div>
        </div>
      </Card>

      {/* Location & Contact */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Visit Our Facility</h2>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">Atarot, Jerusalem, Israel</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Specializations</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">Paint Protection Film</Badge>
              <Badge variant="secondary">Vehicle Wraps</Badge>
              <Badge variant="secondary">Koch-Chemie Training</Badge>
              <Badge variant="secondary">Professional Detailing</Badge>
            </div>
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