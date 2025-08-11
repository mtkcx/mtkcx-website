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
import { useLanguage } from '@/contexts/LanguageContext';

export const MobileHome: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">
          {t('mobile.home.welcome_title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('mobile.home.welcome_subtitle')}
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
            <h2 className="font-bold text-xl mb-2">{t('mobile.home.hero_title')}</h2>
            <p className="text-sm opacity-90">
              {t('mobile.home.hero_subtitle')}
            </p>
          </div>
        </div>
      </Card>

      {/* About Us */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">{t('mobile.home.about_title')}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {t('mobile.home.about_description')}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">250+</div>
            <p className="text-sm text-muted-foreground">{t('mobile.home.premium_products')}</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">1000+</div>
            <p className="text-sm text-muted-foreground">{t('mobile.home.satisfied_customers')}</p>
          </div>
        </div>
      </Card>

      {/* Main Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">Our Main Categories</h2>
        <div className="grid gap-4">
          {/* Interior Cleaning */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Interior Cleaning</h3>
                <p className="text-sm text-muted-foreground">
                  Professional interior detailing products for complete cabin care
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          {/* Exterior Cleaning */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Exterior Cleaning</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced exterior care solutions for spotless vehicle surfaces
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          {/* Polished & Coatings */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Polished & Coatings</h3>
                <p className="text-sm text-muted-foreground">
                  Premium polishes and protective coatings for lasting shine
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>

      {/* Our Services */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">{t('mobile.home.services_title')}</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">{t('mobile.home.service_1_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('mobile.home.service_1_desc')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Palette className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">{t('mobile.home.service_2_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('mobile.home.service_2_desc')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold">{t('mobile.home.service_3_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('mobile.home.service_3_desc')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Gallery */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">{t('mobile.home.gallery_title')}</h2>
        
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
        <h2 className="text-xl font-bold">{t('mobile.home.why_choose_title')}</h2>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">{t('mobile.home.feature_1')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">{t('mobile.home.feature_2')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">{t('mobile.home.feature_3')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">{t('mobile.home.feature_4')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">{t('mobile.home.feature_5')}</span>
          </div>
        </div>
      </Card>

      {/* Visit Our Facility */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">{t('mobile.home.visit_title')}</h2>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">{t('mobile.home.location_title')}</h3>
            <p className="text-sm text-muted-foreground">{t('mobile.home.location_text')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">{t('mobile.home.services_badge_title')}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{t('mobile.home.badge_1')}</Badge>
              <Badge variant="secondary">{t('mobile.home.badge_2')}</Badge>
              <Badge variant="secondary">{t('mobile.home.badge_3')}</Badge>
              <Badge variant="secondary">{t('mobile.home.badge_4')}</Badge>
              <Badge variant="secondary">{t('mobile.home.badge_5')}</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold">{t('mobile.home.established_title')}</h3>
            <p className="text-sm text-muted-foreground">{t('mobile.home.established_text')}</p>
          </div>
        </div>
      </Card>

      {/* User-specific content */}
      {user && (
        <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{t('mobile.home.welcome_back')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('mobile.home.welcome_back_desc')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};