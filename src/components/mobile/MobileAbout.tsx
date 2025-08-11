import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileAboutProps {
  onBack: () => void;
}

export const MobileAbout: React.FC<MobileAboutProps> = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  
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
    t('about.services_array_1'),
    t('about.services_array_2'),
    t('about.services_array_3'),
    t('about.services_array_4'),
    t('about.services_array_5'),
    t('about.services_array_6')
  ];

  return (
    <div className="min-h-screen bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <img 
            src="/lovable-uploads/d780ca10-1c5a-4f83-bbf2-ff0e6949ad40.png" 
            alt="MTKCx Logo" 
            className="h-8 w-auto"
          />
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {t('about.badge')}
          </Badge>
          <h1 className="text-2xl font-bold">{t('about.title')}</h1>
          <p className="text-muted-foreground">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Hero Image */}
        <Card className="overflow-hidden">
          <div className="relative h-48">
            <img
              src="/lovable-uploads/30e3c614-7f57-4a20-ac67-247493252428.png"
              alt="MT Wraps professional automotive facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="font-bold text-lg mb-2">Professional Excellence</h2>
              <p className="text-sm opacity-90">
                Crafting excellence in automotive care
              </p>
            </div>
          </div>
        </Card>

        {/* Our Story */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-bold text-primary">{t('about.story_title')}</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{t('about.story_p1')}</p>
              <p>{t('about.story_p2')}</p>
              <p>{t('about.story_p3')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Koch-Chemie Partnership */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-primary mr-3" />
              <h3 className="text-lg font-semibold">{t('about.koch_partner')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('about.koch_desc')}
            </p>
            <div className="flex items-center text-sm text-primary">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Atarot, Jerusalem</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary text-center">{t('about.our_achievements')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <Card key={index} className="text-center p-4">
                  <CardContent className="p-0">
                    <div className="mx-auto mb-3 p-2 bg-primary/10 rounded-full w-fit">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Training & Wrapping Services */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">{t('common.professional_training')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
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
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>{t('about.industry_experts')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Car className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-lg font-semibold">{t('about.mt_wraps_service')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('about.wraps_excellence')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>{t('about.custom_designs')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>{t('about.premium_materials')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>{t('about.expert_installation')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Values */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary text-center">{t('about.values_title')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="mx-auto mb-3 p-2 bg-white rounded-full w-fit shadow-sm">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{value.title}</h3>
                  <p className="text-xs text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Overview */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-primary">{t('about.what_we_offer')}</h3>
            <div className="space-y-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center p-2 bg-muted/30 rounded">
                  <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location & Contact */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-primary">{t('common.ready_experience_excellence')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('common.join_mt_wraps_family')}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Atarot, Jerusalem</span>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{t('common.established_2020')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};