import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Car, Palette, Shield, Clock, Award, CheckCircle, Star, Phone, Mail, MapPin, Sparkles, Layers, Wrench, Eye, Target, Users, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuoteDialog from '@/components/QuoteDialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [showFullGallery, setShowFullGallery] = useState(false);
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const services: WrapService[] = [{
    id: 'full-wrap',
    title: t('gallery.full_vehicle_wrap'),
    subtitle: t('gallery.complete_transformation'),
    description: t('gallery.full_wrap_desc'),
    features: [t('gallery.complete_color_transformation'), t('gallery.paint_protection_benefits'), t('gallery.custom_design_options'), t('gallery.professional_installation_feature'), t('gallery.removable_without_damage'), t('gallery.increased_resale_value')],
    duration: t('gallery.3_5_days'),
    warranty: t('gallery.5_7_years'),
    popular: true
  }, {
    id: 'partial-wrap',
    title: t('gallery.partial_vehicle_wrap'),
    subtitle: t('gallery.strategic_accent_branding'),
    description: t('gallery.partial_wrap_desc'),
    features: [t('gallery.custom_panel_coverage'), t('gallery.racing_stripes_accents'), t('gallery.business_branding_solutions'), t('gallery.cost_effective_customization'), t('gallery.quick_installation'), t('gallery.easy_maintenance_feature')],
    duration: t('gallery.1_2_days'),
    warranty: t('gallery.5_7_years'),
    popular: false
  }, {
    id: 'color-change',
    title: t('gallery.color_change_wrap'),
    subtitle: t('gallery.premium_color_transformation'),
    description: t('gallery.color_change_desc'),
    features: [t('gallery.vast_color_selection'), t('gallery.multiple_finish_options'), t('gallery.paint_preservation'), t('gallery.reversible_process'), t('gallery.no_permanent_modifications'), t('gallery.factory_paint_protection')],
    duration: t('gallery.3_4_days'),
    warranty: t('gallery.5_7_years'),
    popular: false
  }, {
    id: 'commercial-fleet',
    title: t('gallery.commercial_fleet_wrapping'),
    subtitle: t('gallery.professional_branding_businesses'),
    description: t('gallery.commercial_fleet_desc'),
    features: [t('gallery.brand_consistency_fleet'), t('gallery.high_impact_advertising'), t('gallery.professional_design_service'), t('gallery.volume_pricing_available'), t('gallery.quick_turnaround_times'), t('gallery.long_lasting_visibility')],
    duration: t('gallery.2_3_days_per_vehicle'),
    warranty: t('gallery.5_7_years'),
    popular: true
  }, {
    id: 'protective-film',
    title: t('gallery.paint_protection_film_ppf'),
    subtitle: t('gallery.invisible_protection_investment'),
    description: t('gallery.ppf_desc'),
    features: [t('gallery.invisible_protection'), t('gallery.self_healing_technology'), t('gallery.uv_resistance'), t('gallery.maintains_original_appearance'), t('gallery.easy_cleaning'), t('gallery.preserves_vehicle_value')],
    duration: t('gallery.2_4_days'),
    warranty: t('gallery.10_years'),
    popular: false
  }, {
    id: 'specialty-finishes',
    title: t('gallery.specialty_finishes'),
    subtitle: t('gallery.unique_textures_effects'),
    description: t('gallery.specialty_finishes_desc'),
    features: [t('gallery.carbon_fiber_textures'), t('gallery.metallic_finishes'), t('gallery.chrome_mirror_effects'), t('gallery.textured_surfaces'), t('gallery.custom_patterns'), t('gallery.limited_edition_materials')],
    duration: t('gallery.3_5_days'),
    warranty: t('gallery.3_5_years'),
    popular: false
  }];
  const materials: WrapMaterial[] = [{
    brand: '3M',
    description: t('gallery.3m_description'),
    features: [t('gallery.10_year_warranty'), t('gallery.self_healing_tech'), t('gallery.uv_resistance'), t('gallery.easy_maintenance')]
  }, {
    brand: 'Avery Dennison',
    description: t('gallery.avery_description'),
    features: [t('gallery.vibrant_color_range'), t('gallery.superior_adhesion'), t('gallery.clean_removal'), t('gallery.weather_resistance')]
  }, {
    brand: 'KPMF',
    description: t('gallery.kpmf_description'),
    features: [t('gallery.unique_finish_options'), t('gallery.high_performance_adhesive'), t('gallery.color_stability'), t('gallery.professional_grade')]
  }];
  const process = [{
    step: 1,
    title: 'consultation_design',
    description: 'consultation_desc',
    icon: Eye
  }, {
    step: 2,
    title: 'preparation',
    description: 'preparation_desc',
    icon: Wrench
  }, {
    step: 3,
    title: 'professional_installation',
    description: 'installation_process_desc',
    icon: Target
  }, {
    step: 4,
    title: 'quality_control',
    description: 'quality_control_desc',
    icon: CheckCircle
  }];
  const benefits = [{
    icon: Shield,
    title: 'paint_protection',
    description: 'paint_protection_desc'
  }, {
    icon: Palette,
    title: 'unlimited_customization',
    description: 'customization_desc'
  }, {
    icon: Clock,
    title: 'reversible_process',
    description: 'reversible_desc'
  }, {
    icon: Award,
    title: 'professional_quality',
    description: 'quality_desc'
  }];
  
  const galleryImages = [
    '/lovable-uploads/2bcb5a0f-eefd-4bf9-be12-dbc2d1bea8da.png',
    '/lovable-uploads/30e3c614-7f57-4a20-ac67-247493252428.png',
    '/lovable-uploads/3d7dc22e-86ff-41c1-be13-22c68e59c932.png',
    '/lovable-uploads/3df6143b-1e24-4063-ac21-1f8d68e1c558.png',
    '/lovable-uploads/3f627a82-3732-49c8-9927-8736394acebc.png',
    '/lovable-uploads/467c4fc8-85d3-4b19-a924-11162bf078e7.png',
    '/lovable-uploads/4896db9d-9036-4002-9b50-391aefd27f2b.png',
    '/lovable-uploads/5888e030-a950-4019-a5ea-9d9287fbdcc7.png',
    '/lovable-uploads/5bc324f9-8392-4f77-a7ca-4888e1502d41.png',
    '/lovable-uploads/93339d8c-e8b6-44d4-a598-f792a3019f2d.png',
    '/lovable-uploads/baa55ddc-7737-4bef-b3ae-c2f59f4cf3d9.png'
  ];

  const handleQuoteRequest = async (serviceTitle: string) => {
    if (!user) {
      toast({
        title: t('auth.signin_required'),
        description: t('auth.signin_to_request_quote'),
        action: <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
            {t('auth.sign_in')}
          </Button>
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('quotes').insert({
        user_id: user.id,
        service_type: serviceTitle,
        message: t('gallery.quote_request_message').replace('{service}', serviceTitle),
        status: 'pending'
      });
      if (error) {
        toast({
          title: t('dashboard.error'),
          description: t('dashboard.quotes_fetch_error'),
          variant: 'destructive'
        });
        return;
      }
      toast({
        title: t('common.quote_request_received'),
        description: t('common.contact_service_hours').replace('{service}', serviceTitle)
      });
    } catch (error) {
      toast({
        title: t('dashboard.error'),
        description: t('auth.something_went_wrong'),
        variant: 'destructive'
      });
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner with Title Overlay */}
      <section className="relative mb-8">
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
              <img 
                src="/lovable-uploads/81c355c1-6d78-43e7-b915-6f1e9e64edb5.png" 
                alt="MT Wraps professional vehicle wrapping services logo"
                className="w-full max-w-lg h-auto object-contain opacity-60"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/30" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-5xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight drop-shadow-lg">
                {t('gallery.title')}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed opacity-95 font-light max-w-4xl mx-auto drop-shadow-md">
                {t('gallery.subtitle')}
              </p>
            </div>
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
            return <div key={index} className="text-center p-6">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t(`gallery.${benefit.title}`)}</h3>
                  <p className="text-muted-foreground text-sm">{t(`gallery.${benefit.description}`)}</p>
                </div>;
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
                      {[t('gallery.paint_protection_film'), t('gallery.color_change_wrap'), t('gallery.commercial_fleet')].map((service, index) => <div key={index} className="flex items-center text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {service}
                        </div>)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-primary flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      {t('gallery.additional_services')}
                    </h4>
                    <div className="space-y-3">
                      {[t('gallery.specialty_finishes'), t('gallery.polish_detailing'), t('gallery.professional_detailing')].map((service, index) => <div key={index} className="flex items-center text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {service}
                        </div>)}
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
                        <Shield className="w-6 h-6 text-primary" />
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
                  <div className="flex justify-center">
                    <Button size="lg" onClick={() => { setSelectedService(t('gallery.vehicle_wrapping_services')); setIsQuoteDialogOpen(true); }} className="flex-1 sm:flex-none">
                      <Phone className="w-5 h-5 mr-2" />
                      {t('gallery.contact_quote')}
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
            {process.map(step => {
            const IconComponent = step.icon;
            return <Card key={step.step} className="text-center p-6 hover:shadow-lg transition-all duration-300">
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
                </Card>;
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
            {materials.map((material, index) => <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
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
                    {material.features.map((feature, featureIndex) => <div key={featureIndex} className="flex items-center text-sm justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">{t('common.our_work_gallery')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('common.explore_portfolio')}
            </p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${showFullGallery ? '' : 'max-h-96 overflow-hidden'}`}>
            {(showFullGallery ? galleryImages : galleryImages.slice(0, 6)).map((image, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={image}
                    alt={`Vehicle wrapping project ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              </Card>
            ))}
          </div>
          
          {!showFullGallery && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" onClick={() => setShowFullGallery(true)}>
                <Eye className="w-5 h-5 mr-2" />
                {t('common.view_full_gallery')}
              </Button>
            </div>
          )}
          
          {showFullGallery && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" onClick={() => setShowFullGallery(false)}>
                {t('common.show_less')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact & Quote Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('common.ready_transform_vehicle')}</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              {t('common.contact_consultation')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>052-7738-586</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>info@mtkcx.com</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="w-5 h-5" />
                <span>{t('contact.location_short')}</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="secondary" size="lg" onClick={() => { setSelectedService(t('gallery.vehicle_wrapping_services')); setIsQuoteDialogOpen(true); }}>
                <Phone className="w-5 h-5 mr-2" />
                {t('common.call_for_quote')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <QuoteDialog
        isOpen={isQuoteDialogOpen}
        onClose={() => setIsQuoteDialogOpen(false)}
        serviceType={selectedService}
      />
      
      <Footer />
    </div>;
};
export default Gallery;