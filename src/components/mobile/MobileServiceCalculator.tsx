import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calculator, Camera, CheckCircle, ArrowRight, Plus, Minus } from 'lucide-react';
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

interface VehiclePart {
  id: string;
  name: string;
  image: string;
  prices: {
    small: number;
    medium: number;
    large: number;
    sport: number;
    xlarge: number;
  };
}

interface SelectedPart extends VehiclePart {
  vehicleSize: string;
  quantity: number;
  totalPrice: number;
}

interface VehicleSize {
  id: string;
  name: string;
  description: string;
  image: string;
  packages: Omit<ServicePackage, 'image'>[];
}

export const MobileServiceCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [selectedVehicleSize, setSelectedVehicleSize] = useState<string>('medium');

  const vehicleSizes: VehicleSize[] = [
    {
      id: 'small',
      name: 'Small Vehicle',
      description: 'Perfect for compact cars',
      image: '/lovable-uploads/e3007686-384d-48f1-8701-5abb7189c19a.png',
      packages: [
        {
          id: 'small-hood-bumpers',
          name: 'Hood & Bumpers',
          price: 4500,
          description: 'Basic protection',
          coverage: 'Hood & Bumpers',
          timeEstimate: '3-4 hours',
          features: ['Front Bumper', 'Rear Bumper', 'Hood']
        },
        {
          id: 'small-full-front',
          name: 'Full Front',
          price: 5000,
          description: 'Front protection package',
          coverage: 'Full Front',
          timeEstimate: '4-5 hours',
          features: ['Front Bumper', 'Front Fenders', 'Hood', 'Headlights', 'Mirrors']
        },
        {
          id: 'small-full-car',
          name: 'Full Car',
          price: 11500,
          description: 'Complete vehicle protection',
          coverage: 'Full Car',
          timeEstimate: '8-10 hours',
          popular: true,
          features: ['All body panels', 'Fenders', 'Side Pillars', 'Hood', 'Trunk', 'Doors']
        },
        {
          id: 'small-complete',
          name: 'Complete Coverage',
          price: 14000,
          description: 'Maximum protection package',
          coverage: 'Complete Coverage',
          timeEstimate: '10-12 hours',
          features: ['Full Car', 'Roof', 'Lights', 'Mirrors']
        }
      ]
    },
    {
      id: 'medium',
      name: 'Medium Vehicle',
      description: 'Ideal for SUVs and larger sedans',
      image: '/lovable-uploads/b6c55eb0-1bae-416c-9423-91c12502da3e.png',
      packages: [
        {
          id: 'medium-hood-bumpers',
          name: 'Hood & Bumpers',
          price: 5200,
          description: 'Basic protection',
          coverage: 'Hood & Bumpers',
          timeEstimate: '4-5 hours',
          features: ['Front Bumper', 'Rear Bumper', 'Hood']
        },
        {
          id: 'medium-full-front',
          name: 'Full Front',
          price: 5500,
          description: 'Front protection package',
          coverage: 'Full Front',
          timeEstimate: '5-6 hours',
          features: ['Front Bumper', 'Front Fenders', 'Hood', 'Headlights', 'Mirrors']
        },
        {
          id: 'medium-full-car',
          name: 'Full Car',
          price: 13500,
          description: 'Complete vehicle protection',
          coverage: 'Full Car',
          timeEstimate: '10-12 hours',
          popular: true,
          features: ['All body panels', 'Fenders', 'Side Pillars', 'Hood', 'Trunk', 'Doors']
        },
        {
          id: 'medium-complete',
          name: 'Complete Coverage',
          price: 16000,
          description: 'Maximum protection package',
          coverage: 'Complete Coverage',
          timeEstimate: '12-14 hours',
          features: ['Full Car', 'Roof', 'Lights', 'Mirrors']
        }
      ]
    },
    {
      id: 'large',
      name: 'Large Vehicle',
      description: 'For trucks and large SUVs',
      image: '/lovable-uploads/a9121f45-a22a-4a93-b147-5c6d1d3c31a4.png',
      packages: [
        {
          id: 'large-hood-bumpers',
          name: 'Hood & Bumpers',
          price: 6000,
          description: 'Basic protection',
          coverage: 'Hood & Bumpers',
          timeEstimate: '5-6 hours',
          features: ['Front Bumper', 'Rear Bumper', 'Hood']
        },
        {
          id: 'large-full-front',
          name: 'Full Front',
          price: 6500,
          description: 'Front protection package',
          coverage: 'Full Front',
          timeEstimate: '6-7 hours',
          features: ['Front Bumper', 'Front Fenders', 'Hood', 'Headlights', 'Mirrors']
        },
        {
          id: 'large-full-car',
          name: 'Full Car',
          price: 15300,
          description: 'Complete vehicle protection',
          coverage: 'Full Car',
          timeEstimate: '12-14 hours',
          features: ['All body panels', 'Fenders', 'Side Pillars', 'Hood', 'Trunk', 'Doors']
        },
        {
          id: 'large-complete',
          name: 'Complete Coverage',
          price: 18000,
          description: 'Maximum protection package',
          coverage: 'Complete Coverage',
          timeEstimate: '14-16 hours',
          features: ['Full Car', 'Roof', 'Lights', 'Mirrors']
        }
      ]
    },
    {
      id: 'sport',
      name: 'Sport Vehicle',
      description: 'Premium sports car treatment',
      image: '/lovable-uploads/d8dbc27b-44d0-45d2-9523-5ebbf8bc6b49.png',
      packages: [
        {
          id: 'sport-hood-bumpers',
          name: 'Hood & Bumpers',
          price: 6000,
          description: 'Basic protection',
          coverage: 'Hood & Bumpers',
          timeEstimate: '5-6 hours',
          features: ['Front Bumper', 'Rear Bumper', 'Hood']
        },
        {
          id: 'sport-full-front',
          name: 'Full Front',
          price: 6500,
          description: 'Front protection package',
          coverage: 'Full Front',
          timeEstimate: '6-7 hours',
          features: ['Front Bumper', 'Front Fenders', 'Hood', 'Headlights', 'Mirrors']
        },
        {
          id: 'sport-full-car',
          name: 'Full Car',
          price: 14300,
          description: 'Complete vehicle protection',
          coverage: 'Full Car',
          timeEstimate: '12-14 hours',
          popular: true,
          features: ['All body panels', 'Fenders', 'Side Pillars', 'Hood', 'Trunk', 'Doors']
        },
        {
          id: 'sport-complete',
          name: 'Complete Coverage',
          price: 17000,
          description: 'Maximum protection package',
          coverage: 'Complete Coverage',
          timeEstimate: '14-16 hours',
          features: ['Full Car', 'Roof', 'Lights', 'Mirrors']
        }
      ]
    },
    {
      id: 'xlarge',
      name: 'X-Large Vehicle',
      description: 'For oversized vehicles and fleet',
      image: '/lovable-uploads/145cd8d5-1a51-41fd-b825-3197cfaa948f.png',
      packages: [
        {
          id: 'xlarge-hood-bumpers',
          name: 'Hood & Bumpers',
          price: 8000,
          description: 'Basic protection',
          coverage: 'Hood & Bumpers',
          timeEstimate: '6-7 hours',
          features: ['Front Bumper', 'Rear Bumper', 'Hood']
        },
        {
          id: 'xlarge-full-front',
          name: 'Full Front',
          price: 8500,
          description: 'Front protection package',
          coverage: 'Full Front',
          timeEstimate: '7-8 hours',
          features: ['Front Bumper', 'Front Fenders', 'Hood', 'Headlights', 'Mirrors']
        },
        {
          id: 'xlarge-full-car',
          name: 'Full Car',
          price: 17300,
          description: 'Complete vehicle protection',
          coverage: 'Full Car',
          timeEstimate: '14-16 hours',
          features: ['All body panels', 'Fenders', 'Side Pillars', 'Hood', 'Trunk', 'Doors']
        },
        {
          id: 'xlarge-complete',
          name: 'Complete Coverage',
          price: 20000,
          description: 'Maximum protection package',
          coverage: 'Complete Coverage',
          timeEstimate: '16-18 hours',
          features: ['Full Car', 'Roof', 'Lights', 'Mirrors']
        }
      ]
    }
  ];

  const vehicleParts: VehiclePart[] = [
    {
      id: 'front-bumper',
      name: 'Front Bumper',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1500, medium: 1700, large: 2000, sport: 2000, xlarge: 2300 }
    },
    {
      id: 'rear-bumper',
      name: 'Rear Bumper',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1500, medium: 1700, large: 2000, sport: 2000, xlarge: 2300 }
    },
    {
      id: 'front-fender',
      name: 'Front Fender',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 600, medium: 750, large: 850, sport: 750, xlarge: 950 }
    },
    {
      id: 'rear-fender',
      name: 'Rear Fender',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1500, medium: 2000, large: 2300, sport: 2000, xlarge: 2300 }
    },
    {
      id: 'trunk',
      name: 'Trunk',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1000, medium: 1200, large: 1400, sport: 1200, xlarge: 1500 }
    },
    {
      id: 'hood',
      name: 'Hood',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1500, medium: 1800, large: 2000, sport: 2000, xlarge: 2300 }
    },
    {
      id: 'door',
      name: 'Door',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1000, medium: 1200, large: 1300, sport: 1200, xlarge: 1400 }
    },
    {
      id: 'roof',
      name: 'Roof',
      image: '/lovable-uploads/8093c693-7d1d-42cc-a953-c5bf760ad293.png',
      prices: { small: 1500, medium: 1800, large: 2000, sport: 1800, xlarge: 2300 }
    },
    {
      id: 'headlights',
      name: 'Headlights',
      image: '/lovable-uploads/c3ed6ff6-3bf3-4569-a0fe-ec927c126aaf.png',
      prices: { small: 500, medium: 500, large: 500, sport: 500, xlarge: 500 }
    },
    {
      id: 'mirrors',
      name: 'Mirrors',
      image: '/lovable-uploads/c3ed6ff6-3bf3-4569-a0fe-ec927c126aaf.png',
      prices: { small: 500, medium: 500, large: 500, sport: 500, xlarge: 500 }
    },
    {
      id: 'rocker-panel',
      name: 'Rocker Panel',
      image: '/lovable-uploads/c3ed6ff6-3bf3-4569-a0fe-ec927c126aaf.png',
      prices: { small: 500, medium: 500, large: 500, sport: 500, xlarge: 500 }
    },
    {
      id: 'fender-guard',
      name: 'Fender Guard',
      image: '/lovable-uploads/c3ed6ff6-3bf3-4569-a0fe-ec927c126aaf.png',
      prices: { small: 500, medium: 500, large: 500, sport: 500, xlarge: 500 }
    },
    {
      id: 'rear-roof',
      name: 'Rear Roof',
      image: '/lovable-uploads/c3ed6ff6-3bf3-4569-a0fe-ec927c126aaf.png',
      prices: { small: 500, medium: 500, large: 500, sport: 500, xlarge: 500 }
    }
  ];

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleAddToCart = (pkg: Omit<ServicePackage, 'image'>, vehicleSize: VehicleSize) => {
    addToCart({
      productId: pkg.id,
      productName: `${vehicleSize.name} - ${pkg.name}`,
      productCode: pkg.id,
      variantId: 'default',
      variantSize: 'Standard',
      price: pkg.price,
      imageUrl: vehicleSize.image,
      categoryName: 'Vehicle Wrapping Services'
    });
    
    toast({
      title: 'Service Added',
      description: `${vehicleSize.name} - ${pkg.name} has been added to your cart`,
    });
  };

  const addPart = (part: VehiclePart) => {
    const existingPartIndex = selectedParts.findIndex(
      p => p.id === part.id && p.vehicleSize === selectedVehicleSize
    );

    const priceKey = selectedVehicleSize as keyof typeof part.prices;
    const partPrice = part.prices[priceKey];

    if (existingPartIndex >= 0) {
      const updatedParts = [...selectedParts];
      updatedParts[existingPartIndex].quantity += 1;
      updatedParts[existingPartIndex].totalPrice = updatedParts[existingPartIndex].quantity * partPrice;
      setSelectedParts(updatedParts);
    } else {
      const newPart: SelectedPart = {
        ...part,
        vehicleSize: selectedVehicleSize,
        quantity: 1,
        totalPrice: partPrice
      };
      setSelectedParts([...selectedParts, newPart]);
    }
  };

  const removePart = (partId: string, vehicleSize: string) => {
    const existingPartIndex = selectedParts.findIndex(
      p => p.id === partId && p.vehicleSize === vehicleSize
    );

    if (existingPartIndex >= 0) {
      const updatedParts = [...selectedParts];
      if (updatedParts[existingPartIndex].quantity > 1) {
        updatedParts[existingPartIndex].quantity -= 1;
        const priceKey = vehicleSize as keyof VehiclePart['prices'];
        updatedParts[existingPartIndex].totalPrice = 
          updatedParts[existingPartIndex].quantity * updatedParts[existingPartIndex].prices[priceKey];
      } else {
        updatedParts.splice(existingPartIndex, 1);
      }
      setSelectedParts(updatedParts);
    }
  };

  const getTotalPrice = () => {
    return selectedParts.reduce((total, part) => total + part.totalPrice, 0);
  };

  const addPartsToCart = () => {
    selectedParts.forEach(part => {
      addToCart({
        productId: part.id,
        productName: `${part.name} (${part.vehicleSize})`,
        productCode: part.id,
        variantId: part.vehicleSize,
        variantSize: part.vehicleSize,
        price: part.totalPrice,
        imageUrl: part.image,
        categoryName: 'Vehicle Parts'
      });
    });

    toast({
      title: 'Parts Added to Cart',
      description: `${selectedParts.length} parts added for ₪${getTotalPrice().toLocaleString()}`,
    });

    setSelectedParts([]);
  };

  const handleRequestQuote = () => {
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
          Choose packages or build your custom solution
        </p>
      </div>

      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Service Packages</TabsTrigger>
          <TabsTrigger value="parts">Individual Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {vehicleSizes.map((vehicleSize) => (
              <AccordionItem key={vehicleSize.id} value={vehicleSize.id}>
                <Card className="overflow-hidden">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center space-x-4 w-full">
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                        <img
                          src={vehicleSize.image}
                          alt={vehicleSize.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-lg">{vehicleSize.name}</h3>
                        <p className="text-sm text-muted-foreground">{vehicleSize.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      {vehicleSize.packages.map((pkg) => (
                        <Card 
                          key={pkg.id}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
                            selectedPackage === pkg.id 
                              ? 'ring-2 ring-primary border-primary' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleSelectPackage(pkg.id)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{pkg.name}</h4>
                                {pkg.popular && (
                                  <Badge variant="secondary" className="bg-yellow-500 text-black text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{pkg.description}</p>
                            </div>
                            <Badge variant="default" className="text-lg font-bold px-3 py-1">
                              ₪{pkg.price.toLocaleString()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="font-medium text-muted-foreground">Coverage:</span>
                              <div className="font-semibold">{pkg.coverage}</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Time:</span>
                              <div className="font-semibold">{pkg.timeEstimate}</div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <h5 className="font-medium text-sm">What's included:</h5>
                            <div className="grid grid-cols-1 gap-1">
                              {pkg.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

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
                                  handleAddToCart(pkg, vehicleSize);
                                }}
                                className="flex items-center gap-2"
                              >
                                Add to Cart
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="parts" className="space-y-4">
          {/* Vehicle Size Selector */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Select Vehicle Size</h3>
            <div className="grid grid-cols-5 gap-2">
              {['small', 'medium', 'large', 'sport', 'xlarge'].map((size) => (
                <Button
                  key={size}
                  variant={selectedVehicleSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedVehicleSize(size)}
                  className="capitalize text-xs"
                >
                  {size === 'xlarge' ? 'X-Large' : size}
                </Button>
              ))}
            </div>
          </Card>

          {/* Parts Grid */}
          <div className="space-y-3">
            {vehicleParts.map((part) => {
              const priceKey = selectedVehicleSize as keyof typeof part.prices;
              const partPrice = part.prices[priceKey];
              const selectedPart = selectedParts.find(
                p => p.id === part.id && p.vehicleSize === selectedVehicleSize
              );
              
              return (
                <Card key={`${part.id}-${selectedVehicleSize}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{part.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₪{partPrice.toLocaleString()} per piece
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {selectedPart && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removePart(part.id, selectedVehicleSize)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold min-w-[20px] text-center">
                            {selectedPart.quantity}
                          </span>
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => addPart(part)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Selected Parts Summary */}
          {selectedParts.length > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-3">Selected Parts</h3>
              <div className="space-y-2">
                {selectedParts.map((part, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{part.name} ({part.vehicleSize}) x{part.quantity}</span>
                    <span className="font-semibold">₪{part.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₪{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full mt-3" 
                onClick={addPartsToCart}
                disabled={selectedParts.length === 0}
              >
                Add All to Cart
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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