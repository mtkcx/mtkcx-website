import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, GraduationCap, Car, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceSection = () => {
  const navigate = useNavigate();
  const {
    t,
    isRTL
  } = useLanguage();
  const services = [{
    icon: Package,
    title: t('services.koch_title'),
    description: t('services.koch_description'),
    features: [t('services.koch_features.1'), t('services.koch_features.2'), t('services.koch_features.3')],
    cta: t('services.koch_cta')
  }, {
    icon: GraduationCap,
    title: t('services.courses_title'),
    description: t('services.courses_description'),
    features: [t('services.courses_features.1'), t('services.courses_features.2'), t('services.courses_features.3')],
    cta: t('services.courses_cta')
  }, {
    icon: Car,
    title: t('services.wrapping_title'),
    description: t('services.wrapping_description'),
    features: [t('services.wrapping_features.1'), t('services.wrapping_features.2'), t('services.wrapping_features.3')],
    cta: t('services.wrapping_cta')
  }];
  return <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6">
            {t('services.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">{t('services.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
          const IconComponent = service.icon;
          return <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 will-change-transform hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 sm:p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors gpu-accelerated">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg text-muted-foreground px-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <ul className="space-y-2 sm:space-y-3">
                    {service.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center text-sm sm:text-base text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>)}
                  </ul>
                  
                  <Button
                    className="w-full group-hover:bg-primary/90 transition-colors" 
                    onClick={() => {
                      if (index === 0) {
                        navigate('/products');
                        window.scrollTo(0, 0);
                      } else if (index === 1) {
                        navigate('/courses');
                        window.scrollTo(0, 0);
                      } else if (index === 2) {
                        navigate('/gallery');
                        window.scrollTo(0, 0);
                      }
                    }}
                  >
                    {service.cta}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
                  </Button>
                </CardContent>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default ServiceSection;