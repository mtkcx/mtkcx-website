import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Calendar
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  
  const achievements = [
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

  const services = [
    "Official Koch-Chemie product distribution",
    "Professional detailing and polishing training",
    "Premium vehicle wrapping services",
    "Custom car care solutions",
    "Technical support and consultation",
    "Industry-leading surface treatments"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2">{t('about.badge')}</Badge>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
              {t('about.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">{t('about.story_title')}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    {t('about.story_p1')}
                  </p>
                  <p>
                    {t('about.story_p2')}
                  </p>
                  <p>
                    {t('about.story_p3')}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <Package className="w-8 h-8 text-primary mr-3" />
                      <h3 className="text-xl font-semibold">{t('about.koch_partner')}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {t('about.koch_desc')}
                    </p>
                    <div className="flex items-center text-sm text-primary">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Atarot Industrial Area, Jerusalem</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Achievements</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Building trust through excellence, innovation, and unwavering commitment to quality
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <CardContent className="p-0">
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-muted-foreground text-sm">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Education */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Beyond Products - Education & Excellence</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">Professional Training</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Beyond product sales, we are committed to education and excellence. That's why we offer 
                    intensive detailing and polishing courses, combining theory and hands-on experience to help 
                    professionals raise their standards and deliver top-tier results.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Hands-on practical training</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Professional certification</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Industry expert instructors</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <Car className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">MT Wraps Services</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Our MT Wraps division represents the pinnacle of vehicle customization. From concept to completion, 
                    we deliver stunning transformations that protect and enhance your vehicle's appearance with 
                    precision craftsmanship.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Custom design solutions</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Premium 3M & Avery materials</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Expert installation team</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-white rounded-full w-fit shadow-lg">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">What We Offer</h2>
              <p className="text-muted-foreground">
                Whether you're a professional detailer, a workshop owner, or a passionate car lover — 
                our platform is here to support your journey with premium products, expert knowledge, and trusted service.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center p-4 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Excellence?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join the MT Wraps family and discover why professionals trust us for their automotive care needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Atarot Industrial Area, Jerusalem</span>
              </div>
              <div className="flex items-center text-white/90">
                <Calendar className="w-5 h-5 mr-2" />
                <span>Established 2020</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;