import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Users, 
  Target, 
  Sparkles, 
  Package, 
  GraduationCap, 
  Car,
  CheckCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import aboutBanner from '@/assets/about-banner.jpg';

const About = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const highlights = [
    { icon: Award, title: t('about.achievement_1'), description: t('about.achievement_1_desc') },
    { icon: Users, title: t('about.achievement_2'), description: t('about.achievement_2_desc') },
    { icon: GraduationCap, title: t('about.achievement_3'), description: t('about.achievement_3_desc') },
    { icon: Car, title: t('about.achievement_4'), description: t('about.achievement_4_desc') }
  ];

  const values = [
    { icon: Target, title: t('about.value_precision'), description: t('about.value_precision_desc') },
    { icon: Sparkles, title: t('about.value_innovation'), description: t('about.value_innovation_desc') },
    { icon: CheckCircle, title: t('about.value_quality'), description: t('about.value_quality_desc') },
    { icon: Users, title: t('about.value_education'), description: t('about.value_education_desc') }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Banner Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={aboutBanner}
            alt="MT Wraps professional automotive facility and team expertise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-6">
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              {t('about.badge')}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story - Condensed */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Story Content */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">{t('about.story_title')}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t('about.story_p1')}</p>
                  <p>{t('about.story_p2')}</p>
                </div>
              </div>

              {/* Koch-Chemie Partner Card */}
              <div>
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <Package className="w-6 h-6 text-primary mr-3" />
                      <h3 className="text-lg font-semibold">{t('about.koch_partner')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('about.koch_desc')}
                    </p>
                    <div className="flex items-center text-xs text-primary">
                      <MapPin className="w-3 h-3 mr-2" />
                      <span>Atarot, Jerusalem</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights - Streamlined */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-8">{t('about.our_achievements')}</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((highlight, index) => {
                const IconComponent = highlight.icon;
                return (
                  <Card key={index} className="text-center p-4 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="mx-auto mb-3 p-2 bg-primary/10 rounded-full w-fit">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base mb-1">{highlight.title}</h3>
                      <p className="text-muted-foreground text-xs md:text-sm">{highlight.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview - Compact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Training Services */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">{t('common.professional_training')}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {t('about.beyond_sales')}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{t('about.hands_on_training')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{t('about.certification_programs')}</span>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => navigate('/courses')}>
                    {t('nav.courses')}
                  </Button>
                </CardContent>
              </Card>

              {/* Wrapping Services */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <Car className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">{t('about.mt_wraps_service')}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {t('about.wraps_excellence')}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{t('about.paint_protection_films')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{t('about.custom_designs')}</span>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => navigate('/gallery')}>
                    {t('nav.wrapping')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values - Simplified */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-8">{t('about.values_title')}</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="mx-auto mb-3 p-3 bg-white rounded-full w-fit shadow-lg">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('contact.title')}</h2>
            <p className="text-lg mb-8 text-white/90">
              {t('about.story_p3')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center text-white/90">
                <Phone className="w-5 h-5 mr-2" />
                <span>0527738586</span>
              </div>
              <div className="flex items-center text-white/90">
                <Mail className="w-5 h-5 mr-2" />
                <span>info@mtkcx.com</span>
              </div>
              <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Atarot, Jerusalem</span>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="mt-6 px-8" 
              onClick={() => navigate('/contact')}
            >
              {t('nav.contact')}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;