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

      {/* Course Introduction Video */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-4">{t('courses.intro_title')}</h2>
              <p className="text-muted-foreground">{t('courses.intro_subtitle')}</p>
            </div>
            
            {/* Video Container - Replace src with your actual video URL */}
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-muted-foreground">{t('courses.course_intro_video')}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t('courses.video_placeholder')}</p>
                </div>
              </div>
              {/* Uncomment and add your video URL when ready */}
              {/* <iframe 
                width="100%" 
                height="100%" 
                src="YOUR_VIDEO_URL_HERE" 
                title="Course Introduction" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe> */}
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{t('courses.professional_certification')}</h3>
                      <p className="text-muted-foreground">{t('courses.interactive_training')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{t('courses.contact_pricing')}</div>
                    <div className="text-sm text-muted-foreground">{t('courses.includes_certification')}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      {t('courses.what_learn')}
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
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
                        {t('courses.product_knowledge')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.paint_correction')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.surface_assessment')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.machine_polishing')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('courses.quality_control')}
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
                    <div className="space-y-4">
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">{t('courses.day_1')}</h5>
                        <p className="text-sm text-muted-foreground">{t('courses.day_1_desc')}</p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">{t('courses.day_2')}</h5>
                        <p className="text-sm text-muted-foreground">{t('courses.day_2_desc')}</p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">{t('courses.day_3')}</h5>
                        <p className="text-sm text-muted-foreground">{t('courses.day_3_desc')}</p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">{t('courses.day_4')}</h5>
                        <p className="text-sm text-muted-foreground">{t('courses.day_4_desc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    {t('courses.why_choose')}
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">{t('courses.official_certification')}</h5>
                      <p className="text-sm text-muted-foreground">{t('courses.recognized_cert')}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">{t('courses.expert_instructors')}</h5>
                      <p className="text-sm text-muted-foreground">{t('courses.certified_professionals')}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">{t('courses.interactive_hands_on')}</h5>
                      <p className="text-sm text-muted-foreground">{t('courses.practical_training')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold mb-4">{t('courses.course_includes')}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.product_kit')}
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.equipment_access')}
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.training_materials')}
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.practice_vehicles')}
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.certification_included')}
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.lunch_refreshments')}
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.digital_materials')}
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {t('courses.post_support')}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" onClick={handleEnrollment}>
                    <Calendar className="h-5 w-5 mr-2" />
                    {t('courses.enroll_now')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Information */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Training Schedule */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-primary flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  {t('courses.training_schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">{t('courses.course_duration')}</span>
                    <span className="text-primary font-semibold">{t('courses.four_days')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">{t('courses.training_format')}</span>
                    <span className="text-primary font-semibold">{t('courses.interactive_format')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">{t('courses.class_size')}</span>
                    <span className="text-primary font-semibold">{t('courses.small_groups')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">{t('courses.location')}</span>
                    <span className="text-primary font-semibold">{t('courses.atarot_location')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">{t('courses.training_hours')}</span>
                    <span className="text-primary font-semibold">{t('courses.tba')}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {t('courses.next_dates')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('courses.contact_schedule')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-primary">
                  {t('courses.ready_certified')}
                </CardTitle>
                <p className="text-muted-foreground">
                  {t('courses.contact_training')}
                </p>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t('courses.call_us')}</p>
                      <p className="text-sm text-muted-foreground">0527738586</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t('courses.email_us')}</p>
                      <p className="text-sm text-muted-foreground">info@mtkcx.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t('common.visit_us')}</p>
                      <p className="text-sm text-muted-foreground">{t('courses.atarot_location')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('common.koch_official_training')}</h4>
                  <p className="text-sm text-primary-foreground/90">
                    {t('common.only_official_course')}
                  </p>
                </div>

                <Button className="w-full" size="lg" onClick={handleEnrollment}>
                  <Mail className="w-5 h-5 mr-2" />
                  {t('common.get_course_info')}
                </Button>
              </CardContent>
            </Card>
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