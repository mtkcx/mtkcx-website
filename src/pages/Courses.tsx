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
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
                  {t("courses.title")}
                </h1>
                
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg md:text-xl lg:text-2xl leading-relaxed opacity-95 font-light">
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
                    <h4 className="font-semibold text-lg">{t('courses.what_learn')}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {t('courses.professional_techniques')}</li>
                      <li>• {t('courses.advanced_polishing')}</li>
                      <li>• {t('courses.business_practices')}</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">{t('courses.course_details')}</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>{t('courses.course_duration')}:</strong> {t('courses.four_days')}</p>
                      <p><strong>{t('courses.class_size')}:</strong> {t('courses.small_groups')}</p>
                      <p><strong>{t('courses.location')}:</strong> {t('courses.atarot_location')}</p>
                    </div>
                  </div>
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
                  <span className="font-medium">0527738586</span>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="font-medium">info@mtkcx.com</span>
                </div>
              </div>
            </div>

            <Button size="lg" className="px-8 py-3" onClick={handleEnrollment}>
              <Mail className="w-5 h-5 mr-2" />
              {t('common.get_course_info')}
            </Button>
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