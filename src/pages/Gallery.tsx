import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Car, 
  Palette, 
  Shield, 
  Clock, 
  Award, 
  CheckCircle, 
  Star,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Layers,
  Wrench,
  Eye,
  Target,
  Users,
  Calendar
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface WrapService {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  duration: string;
  warranty: string;
  popular: boolean;
}

interface WrapMaterial {
  brand: string;
  description: string;
  features: string[];
}

const Gallery = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const services: WrapService[] = [
    {
      id: 'full-wrap',
      title: 'Full Vehicle Wrap',
      subtitle: 'Complete transformation of your vehicle',
      description: 'Transform your entire vehicle with a complete color change or custom design. Our full wraps provide maximum impact and protection for your vehicle\'s original paint.',
      features: [
        'Complete color transformation',
        'Paint protection benefits',
        'Custom design options',
        'Professional installation',
        'Removable without damage',
        'Increased resale value protection'
      ],
      duration: '3-5 Days',
      warranty: '5-7 Years',
      popular: true
    },
    {
      id: 'partial-wrap',
      title: 'Partial Vehicle Wrap',
      subtitle: 'Strategic accent and branding solutions',
      description: 'Perfect for businesses or personal customization. Cover specific panels, create racing stripes, or add accent colors to make your vehicle stand out.',
      features: [
        'Custom panel coverage',
        'Racing stripes and accents',
        'Business branding solutions',
        'Cost-effective customization',
        'Quick installation',
        'Easy maintenance'
      ],
      duration: '1-2 Days',
      warranty: '5-7 Years',
      popular: false
    },
    {
      id: 'color-change',
      title: 'Color Change Wrap',
      subtitle: 'Premium color transformation',
      description: 'Change your vehicle\'s color completely with premium automotive films. Choose from matte, gloss, satin, or specialty finishes for a unique look.',
      features: [
        'Vast color selection',
        'Multiple finish options',
        'Paint preservation',
        'Reversible process',
        'No permanent modifications',
        'Factory paint protection'
      ],
      duration: '3-4 Days',
      warranty: '5-7 Years',
      popular: false
    },
    {
      id: 'commercial-fleet',
      title: 'Commercial Fleet Wrapping',
      subtitle: 'Professional branding for businesses',
      description: 'Turn your fleet into moving billboards. Professional vehicle wrapping for businesses, delivery services, and commercial operations.',
      features: [
        'Brand consistency across fleet',
        'High-impact advertising',
        'Professional design service',
        'Volume pricing available',
        'Quick turnaround times',
        'Long-lasting visibility'
      ],
      duration: '2-3 Days per vehicle',
      warranty: '5-7 Years',
      popular: true
    },
    {
      id: 'protective-film',
      title: 'Paint Protection Film (PPF)',
      subtitle: 'Invisible protection for your investment',
      description: 'Clear protective film that shields your vehicle\'s paint from rock chips, scratches, and environmental damage while maintaining the original appearance.',
      features: [
        'Invisible protection',
        'Self-healing technology',
        'UV resistance',
        'Maintains original appearance',
        'Easy cleaning',
        'Preserves vehicle value'
      ],
      duration: '2-4 Days',
      warranty: '10 Years',
      popular: false
    },
    {
      id: 'specialty-finishes',
      title: 'Specialty Finishes',
      subtitle: 'Unique textures and effects',
      description: 'Stand out with specialty finishes including carbon fiber, brushed metal, chrome, and textured films for a truly unique appearance.',
      features: [
        'Carbon fiber textures',
        'Metallic finishes',
        'Chrome and mirror effects',
        'Textured surfaces',
        'Custom patterns',
        'Limited edition materials'
      ],
      duration: '3-5 Days',
      warranty: '3-5 Years',
      popular: false
    }
  ];

  const materials: WrapMaterial[] = [
    {
      brand: '3M',
      description: 'Industry-leading automotive films with superior durability and finish quality.',
      features: ['10+ year warranty options', 'Self-healing technology', 'UV resistance', 'Easy maintenance']
    },
    {
      brand: 'Avery Dennison',
      description: 'Premium vinyl films known for excellent conformability and color accuracy.',
      features: ['Vibrant color range', 'Superior adhesion', 'Clean removal', 'Weather resistance']
    },
    {
      brand: 'KPMF',
      description: 'German-engineered films offering exceptional quality and innovative finishes.',
      features: ['Unique finish options', 'High-performance adhesive', 'Color stability', 'Professional grade']
    }
  ];

  const process = [
    {
      step: 1,
      title: 'consultation_design',
      description: 'consultation_desc',
      icon: Eye
    },
    {
      step: 2,
      title: 'preparation',
      description: 'preparation_desc',
      icon: Wrench
    },
    {
      step: 3,
      title: 'professional_installation',
      description: 'installation_process_desc',
      icon: Target
    },
    {
      step: 4,
      title: 'quality_control',
      description: 'quality_control_desc',
      icon: CheckCircle
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'paint_protection',
      description: 'paint_protection_desc'
    },
    {
      icon: Palette,
      title: 'unlimited_customization',
      description: 'customization_desc'
    },
    {
      icon: Clock,
      title: 'reversible_process',
      description: 'reversible_desc'
    },
    {
      icon: Award,
      title: 'professional_quality',
      description: 'quality_desc'
    }
  ];

  const handleQuoteRequest = (serviceTitle: string) => {
    toast({
      title: "Quote Request Received!",
      description: `We'll contact you about ${serviceTitle} within 24 hours.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2">{t('common.mt_wraps_services')}</Badge>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
              {t('gallery.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('gallery.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('gallery.why_choose_wrapping')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.wrapping_advantages')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t(`gallery.${benefit.title}`)}</h3>
                  <p className="text-muted-foreground text-sm">{t(`gallery.${benefit.description}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('gallery.services_title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.services_subtitle')}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-lg">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Car className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-primary mb-4">
                  {t('gallery.professional_title')}
                </CardTitle>
                <p className="text-lg text-muted-foreground">
                  {t('gallery.professional_description')}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Services List */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-primary flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('gallery.wrapping_services')}
                    </h4>
                    <div className="space-y-3">
                      {[
                        t('gallery.paint_protection_film'),
                        t('gallery.color_change_wrap'), 
                        t('gallery.commercial_fleet')
                      ].map((service, index) => (
                        <div key={index} className="flex items-center text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-primary flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      {t('gallery.additional_services')}
                    </h4>
                    <div className="space-y-3">
                      {[
                        t('gallery.specialty_finishes'),
                        t('gallery.polish_detailing'),
                        t('gallery.professional_detailing')
                      ].map((service, index) => (
                        <div key={index} className="flex items-center text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-primary/5 rounded-lg p-6">
                  <h4 className="font-semibold text-lg text-primary mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    {t('gallery.why_choose_services')}
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Shield className="w-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">{t('gallery.premium_materials')}</h5>
                      <p className="text-sm text-muted-foreground">{t('gallery.materials_desc')}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">{t('gallery.expert_installation')}</h5>
                      <p className="text-sm text-muted-foreground">{t('gallery.installation_desc')}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">{t('gallery.quality_guarantee')}</h5>
                      <p className="text-sm text-muted-foreground">{t('gallery.guarantee_desc')}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    {t('gallery.ready_transform')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => handleQuoteRequest("Vehicle Wrapping Services")}
                      className="flex-1 sm:flex-none"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {t('gallery.contact_quote')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => handleQuoteRequest("Service Consultation")}
                      className="flex-1 sm:flex-none"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {t('gallery.request_consultation')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('gallery.professional_process')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.process_desc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step) => {
              const IconComponent = step.icon;
              return (
                <Card key={step.step} className="text-center p-6 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div className="mb-2">
                      <Badge variant="secondary" className="mb-2">{t('gallery.step')} {step.step}</Badge>
                      <h3 className="font-semibold text-lg">{t(`gallery.${step.title}`)}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{t(`gallery.${step.description}`)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Materials & Brands */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('gallery.premium_materials_title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.materials_subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {materials.map((material, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary mb-2">
                    {material.brand}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{material.description}</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {material.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Work Gallery</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our portfolio of vehicle transformations and custom projects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="aspect-video overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <Car className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Project Gallery Image</p>
                    <p className="text-xs text-muted-foreground">(Images coming soon)</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              <Eye className="w-5 h-5 mr-2" />
              View Full Gallery
            </Button>
          </div>
        </div>
      </section>

      {/* Contact & Quote Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Vehicle?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Contact us today for a personalized consultation and quote for your vehicle wrapping project.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>052-5701-073</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>info@mtkcx.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5" />
                <span>Atarot Industrial Area</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <Phone className="w-5 h-5 mr-2" />
                Call for Quote
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;