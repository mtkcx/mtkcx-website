import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShoppingCart, GraduationCap, Sparkles } from 'lucide-react';
const Hero = () => {
  const {
    t,
    isRTL
  } = useLanguage();
  return <section className="relative bg-gradient-to-br from-background via-background to-secondary min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="container relative z-10 px-0 mx-[26px] py-[78px]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Official KochChemie Partner
            </div>
            
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight md:text-4xl">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed md:text-base">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button size="lg" className="px-8 py-6 h-auto min-w-[200px] text-sm">
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t('hero.cta.products')}
            </Button>
            
            <Button variant="outline" size="lg" className="px-8 py-6 h-auto min-w-[200px] border-2 text-sm">
              <GraduationCap className="w-5 h-5 mr-2" />
              {t('hero.cta.courses')}
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-border">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">250+</div>
              <div className="text-muted-foreground">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">80+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;