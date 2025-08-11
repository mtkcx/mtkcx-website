import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Camera, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  coverage: string;
  timeEstimate: string;
  popular?: boolean;
  image: string;
}

export const MobileServiceCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  const servicePackages: ServicePackage[] = [
    {
      id: 'small',
      name: 'Small Vehicle Package',
      price: 1200,
      description: 'Perfect for compact cars and sedans',
      coverage: 'Partial coverage',
      timeEstimate: '3-4 hours',
      image: '/lovable-uploads/2bcb5a0f-eefd-4bf9-be12-dbc2d1bea8da.png',
      features: [
        'Hood and roof wrapping',
        'Mirror caps',
        'Basic protection',
        '2-year warranty'
      ]
    },
    {
      id: 'medium',
      name: 'Medium Vehicle Package', 
      price: 2200,
      description: 'Ideal for SUVs and larger sedans',
      coverage: 'Extended coverage',
      timeEstimate: '6-8 hours',
      popular: true,
      image: '/lovable-uploads/5888e030-a950-4019-a5ea-9d9287fbdcc7.png',
      features: [
        'Full body coverage',
        'Window tinting',
        'Paint protection',
        '3-year warranty',
        'Free maintenance'
      ]
    },
    {
      id: 'large',
      name: 'Large Vehicle Package',
      price: 3500,
      description: 'For trucks and commercial vehicles',
      coverage: 'Complete coverage', 
      timeEstimate: '8-12 hours',
      image: '/lovable-uploads/4896db9d-9036-4002-9b50-391aefd27f2b.png',
      features: [
        'Full commercial wrap',
        'Custom graphics',
        'Premium materials',
        '5-year warranty',
        'Free annual inspection'
      ]
    },
    {
      id: 'sport',
      name: 'Sport Package',
      price: 4200,
      description: 'Premium sports car treatment',
      coverage: 'Performance coverage',
      timeEstimate: '10-14 hours',
      image: '/lovable-uploads/5bc324f9-8392-4f77-a7ca-4888e1502d41.png',
      features: [
        'Performance vinyl',
        'Custom racing stripes', 
        'Aerodynamic considerations',
        '5-year warranty',
        'Track-ready finish'
      ]
    },
    {
      id: 'xlarge',
      name: 'X-Large Package',
      price: 5500,
      description: 'For oversized vehicles and fleet wraps',
      coverage: 'Maximum coverage',
      timeEstimate: '12-16 hours',
      image: '/lovable-uploads/baa55ddc-7737-4bef-b3ae-c2f59f4cf3d9.png',
      features: [
        'Full fleet capability',
        'Commercial branding',
        'Heavy-duty materials',
        '7-year warranty',
        'Fleet maintenance program'
      ]
    }
  ];

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleAddToCart = (pkg: ServicePackage) => {
    addToCart({
      productId: pkg.id,
      productName: pkg.name,
      productCode: pkg.id,
      variantId: 'default',
      variantSize: 'Standard',
      price: pkg.price,
      imageUrl: pkg.image,
      categoryName: 'Vehicle Wrapping Services'
    });
    
    toast({
      title: 'Service Added',
      description: `${pkg.name} has been added to your cart`,
    });
  };

  const handleRequestQuote = () => {
    // This would open a quote dialog or navigate to quote page
    toast({
      title: 'Quote Request',
      description: 'Redirecting to quote form...',
    });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Vehicle Wrapping Calculator</h2>
        </div>
        <p className="text-muted-foreground">
          Choose the perfect wrapping package for your vehicle
        </p>
      </div>

      {/* Service Packages */}
      <div className="space-y-4">
        {servicePackages.map((pkg) => (
          <Card 
            key={pkg.id}
            className={`overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedPackage === pkg.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelectPackage(pkg.id)}
          >
            {/* Package Image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Price Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant="default" className="text-lg font-bold px-3 py-1">
                  ${pkg.price.toLocaleString()}
                </Badge>
              </div>
              
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-yellow-500 text-black font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {/* Package Name Overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-bold text-white text-xl">{pkg.name}</h3>
                <p className="text-white/90 text-sm">{pkg.description}</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Package Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Coverage:</span>
                  <div className="font-semibold">{pkg.coverage}</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Time:</span>
                  <div className="font-semibold">{pkg.timeEstimate}</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What's included:</h4>
                <div className="grid grid-cols-1 gap-1">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedPackage === pkg.id && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestQuote();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Get Quote
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(pkg);
                    }}
                    className="flex items-center gap-2"
                  >
                    Add to Cart
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="text-center space-y-3">
          <h3 className="font-semibold">Need a Custom Solution?</h3>
          <p className="text-sm text-muted-foreground">
            Our experts can create a personalized package for your specific needs
          </p>
          <Button variant="outline" className="w-full">
            Speak with an Expert
          </Button>
        </div>
      </Card>
    </div>
  );
};