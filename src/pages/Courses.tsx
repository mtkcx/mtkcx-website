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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('courses.course_title')}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('courses.course_description')}
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{t('courses.professional_certification')}</h3>
                      <p className="text-muted-foreground">{t('courses.interactive_training')}</p>
                    </div>
                  </div>
                </div>

                {/* Course Overview - Simplified */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      {t('courses.what_learn')}
                    </h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.professional_techniques')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.advanced_polishing')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.paint_correction')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.business_practices')}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      {t('courses.course_structure')}
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">4</div>
                        <div className="font-medium mb-1">{t('courses.four_days')}</div>
                        <div className="text-sm text-muted-foreground">{t('courses.interactive_format')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Benefits - Simplified */}
                <div className="bg-primary/5 rounded-lg p-6 mb-8">
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-2">{t('courses.official_certification')}</h5>
                      <p className="text-sm text-muted-foreground">{t('courses.recognized_cert')}</p>
                    </div>
                    <div>
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-2">{t('courses.expert_instructors')}</h5>
                      <p className="text-sm text-muted-foreground">{t('courses.small_groups')}</p>
                    </div>
                    <div>
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-2">{t('courses.product_kit')}</h5>
                      <p className="text-sm text-muted-foreground">{t('courses.certification_included')}</p>
                    </div>
                  </div>
                </div>

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

      {/* Quick Facts & Contact */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Essential Course Info */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('courses.ready_certified')}</h2>
              <p className="text-muted-foreground">
                {t('courses.contact_training')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Quick Facts */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <span className="font-medium">{t('courses.course_duration')}</span>
                      <span className="text-primary font-semibold">{t('courses.four_days')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <span className="font-medium">{t('courses.location')}</span>
                      <span className="text-primary font-semibold">{t('courses.atarot_location')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <span className="font-medium">{t('courses.class_size')}</span>
                      <span className="text-primary font-semibold">{t('courses.small_groups')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">0527738586</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">info@mtkcx.com</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 text-center">
                    <p className="text-sm font-medium text-primary">
                      {t('common.koch_official_training')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button size="lg" className="px-8 py-3" onClick={handleEnrollment}>
                <Mail className="w-5 h-5 mr-2" />
                {t('common.get_course_info')}
              </Button>
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