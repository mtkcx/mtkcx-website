import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, GraduationCap, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const Hero = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    t,
    isRTL
  } = useLanguage();
  return <section className="relative min-h-[80vh] sm:min-h-[85vh] lg:min-h-[80vh] flex items-center justify-center">
      {/* Hero Banner Image */}
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/3f627a82-3732-49c8-9927-8736394acebc.png" 
          alt="Professional car detailing banner" 
          className="w-full h-full object-cover gpu-accelerated" 
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="container relative z-10 px-4 sm:px-6 mx-auto py-12 sm:py-16 lg:py-20 w-full">
        <div className="max-w-5xl mx-auto text-center w-full animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/10 text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm">
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              {t('common.official_partner')}
            </div>
            
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 sm:mb-8 ${isRTL ? 'leading-[1.4] sm:leading-[1.3]' : 'leading-tight'} px-2 sm:px-4`}>
              {t('hero.title')}
            </h1>
            
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl lg:max-w-3xl mx-auto ${isRTL ? 'leading-[1.8] sm:leading-[1.7]' : 'leading-relaxed'} px-4 sm:px-6`}>
              {t('hero.subtitle')}
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-2 sm:mt-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button size="lg" className="px-6 sm:px-8 py-4 sm:py-6 h-auto min-w-[180px] sm:min-w-[200px] border-2 text-sm will-change-transform hover:scale-105 transition-transform" onClick={() => {
              navigate('/products');
              window.scrollTo(0, 0);
            }}>
              <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              {t('hero.cta.products')}
            </Button>
            
            <Button variant="outline-white" size="lg" className="px-6 sm:px-8 py-4 sm:py-6 h-auto min-w-[180px] sm:min-w-[200px] text-sm will-change-transform hover:scale-105 transition-transform" onClick={() => {
              navigate('/courses');
              window.scrollTo(0, 0);
            }}>
              <GraduationCap className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              {t('hero.cta.courses')}
            </Button>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">250+</div>
              <div className="text-sm sm:text-base text-white/80">{t('stats.products')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-sm sm:text-base text-white/80">{t('stats.customers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">4+</div>
              <div className="text-sm sm:text-base text-white/80">{t('stats.experience')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;