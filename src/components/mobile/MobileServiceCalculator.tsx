import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Camera, CheckCircle } from 'lucide-react';
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
      features: [
        'Performance vinyl',
        'Custom racing stripes',
        'Aerodynamic considerations',
        '5-year warranty',
        'Track-ready finish'
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
      imageUrl: '/placeholder.svg',
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
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedPackage === pkg.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelectPackage(pkg.id)}
          >
            <div className="space-y-3">
              {/* Package Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{pkg.name}</h3>
                  {pkg.popular && (
                    <Badge variant="default" className="text-xs">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${pkg.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm">{pkg.description}</p>

              {/* Package Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Coverage:</span>
                  <div className="text-muted-foreground">{pkg.coverage}</div>
                </div>
                <div>
                  <span className="font-medium">Time:</span>
                  <div className="text-muted-foreground">{pkg.timeEstimate}</div>
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