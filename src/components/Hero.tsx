import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, GraduationCap, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    t,
    isRTL
  } = useLanguage();
  return <section className="relative min-h-[80vh] flex items-center justify-center">
      {/* Hero Banner Image */}
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/3f627a82-3732-49c8-9927-8736394acebc.png" 
          alt="Professional car detailing banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="container relative z-10 px-4 mx-auto py-[78px] w-full">
        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('common.official_partner')}
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight md:text-4xl">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed md:text-base">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button 
              size="lg" 
              className="px-8 py-6 h-auto min-w-[200px] text-sm"
              onClick={() => navigate('/products')}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t('hero.cta.products')}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 h-auto min-w-[200px] border-2 text-sm"
              onClick={() => navigate('/courses')}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              {t('hero.cta.courses')}
            </Button>

            {user && (
              <Button 
                variant="secondary" 
                size="lg" 
                className="px-8 py-6 h-auto min-w-[200px] text-sm"
                onClick={() => navigate('/dashboard')}
              >
                <User className="w-5 h-5 mr-2" />
                {t('auth.dashboard')}
              </Button>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-white/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">250+</div>
              <div className="text-white/80">{t('stats.products')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-white/80">{t('stats.customers')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4+</div>
              <div className="text-white/80">{t('stats.experience')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;