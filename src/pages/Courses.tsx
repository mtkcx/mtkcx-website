import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Star, Calendar, MapPin, Phone, Mail, BookOpen, Users, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import EnrollmentDialog from '@/components/EnrollmentDialog';
const Courses = () => {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  
  const handleEnrollment = () => {
    setIsEnrollmentDialogOpen(true);
  };
  return <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section with Banner */}
      <section className="relative">
        <div className="relative overflow-hidden">
          <img 
            src="/lovable-uploads/30e3c614-7f57-4a20-ac67-247493252428.png" 
            alt="Professional car detailing training session with multiple students learning hands-on techniques on a luxury vehicle in our state-of-the-art facility"
            className="w-full h-[70vh] md:h-[80vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-6">
              <div className="max-w-5xl mx-auto text-center text-white">
                <Badge className="mb-8 px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-colors">
                  {t("common.professional_training")}
                </Badge>
                
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 max-w-4xl mx-auto">
                  <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-white ${isRTL ? 'leading-[1.6] tracking-wide py-4 space-y-2' : 'leading-tight tracking-tight'}`} style={isRTL ? { lineHeight: '2.5em', paddingTop: '1rem', paddingBottom: '1rem' } : {}}>
                    <span className={isRTL ? 'block py-1' : ''}>
                      {t("courses.title")}
                    </span>
                  </h1>
                  
                  <p className={`text-lg md:text-xl lg:text-2xl text-white/95 font-light ${isRTL ? 'leading-[1.9] tracking-wide' : 'leading-relaxed'}`}>
                    {t("courses.subtitle")}
                  </p>
                </div>
                
                {/* Call to Action */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg"
                    onClick={handleEnrollment}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {t("courses.enroll_now")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Main Course Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('courses.course_title')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('courses.course_description')}
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-8">
                {/* Simple Course Info */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">{t('courses.theoretical_aspect')}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {t('courses.car_paint_understanding')}</li>
                      <li>• {t('courses.chemical_compositions')}</li>
                      <li>• {t('courses.practical_solutions')}</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">{t('courses.practical_aspect')}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {t('courses.professional_cleaning')}</li>
                      <li>• {t('courses.different_materials')}</li>
                      <li>• {t('courses.rupes_training')}</li>
                      <li>• {t('courses.restoration_steps')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 mb-8">
                  <p className="text-muted-foreground leading-relaxed">
                    {t('courses.course_goal')}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">{t('courses.course_duration')}</h4>
                    <p className="text-muted-foreground">{t('courses.four_days')}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">{t('courses.class_size')}</h4>
                    <p className="text-muted-foreground">{t('courses.small_groups_5')}</p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">{t('courses.location')}</h4>
                    <p className="text-muted-foreground">{t('courses.atarot_location')}</p>
                  </div>
                </div>

                {/* Koch Chemie Certification Notice */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-lg">{t('courses.certification_included')}</h4>
                  </div>
                  <p className="text-muted-foreground">{t('courses.koch_certification_desc')}</p>
                </div>

                {/* Single CTA */}
                <div className="text-center">
                  <Button size="lg" className="px-8 py-3" onClick={handleEnrollment}>
                    <Calendar className="h-5 w-5 mr-2" />
                    {t('courses.enroll_now')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('courses.ready_certified')}</h2>
            
            <div className="bg-card rounded-lg p-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="font-medium">052-5701073</span>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-medium">info@mtkcx.com</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      
      {/* Enrollment Dialog */}
      <EnrollmentDialog 
        isOpen={isEnrollmentDialogOpen} 
        onClose={() => setIsEnrollmentDialogOpen(false)} 
      />
    </div>;
};
export default Courses;