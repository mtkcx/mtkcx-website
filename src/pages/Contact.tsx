import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  User,
  Building,
  Car,
  Package,
  GraduationCap,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import contactBanner from '@/assets/contact-banner.jpg';

const Contact = () => {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    serviceInterest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-contact-message', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || '',
          subject: formData.subject,
          message: formData.message,
          serviceInterest: formData.serviceInterest
        }
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: t('contact.success_title'),
        description: t('contact.success_desc'),
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        serviceInterest: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: t('contact.error_title'),
        description: t('contact.error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

   const contactInfo = [
     {
       icon: Phone,
       title: t('contact.phone_title'),
       details: "0527738586",
       description: t('contact.phone_desc')
     },
     {
       icon: Mail,
       title: t('contact.email_title'),
       details: "info@mtkcx.com",
       description: t('contact.email_desc')
     },
     {
       icon: MapPin,
       title: t('contact.location_title'),
       details: t('contact.location_address'),
       description: t('contact.location_desc')
     },
     {
       icon: Clock,
       title: t('contact.hours_title'),
       details: t('contact.hours_details'),
       description: t('contact.hours_desc')
     }
   ];

  const services = [
    { value: "products", label: t('contact.koch_products'), icon: Package },
    { value: "training", label: t('contact.detailing_training'), icon: GraduationCap },
    { value: "wrapping", label: t('contact.vehicle_wrapping'), icon: Car },
    { value: "consultation", label: t('contact.professional_consultation'), icon: MessageSquare },
    { value: "other", label: t('contact.other_services'), icon: Building }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Banner Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={contactBanner}
            alt="Professional automotive contact and consultation services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-6">
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              {t('contact.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              {t('contact.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fade-in">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>
      

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
            
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{t('contact.form_title')}</CardTitle>
              <CardDescription>
                {t('contact.form_subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {t('contact.name')}
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder={t('contact.name_placeholder')}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {t('contact.email')}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={t('contact.email_placeholder')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {t('contact.phone')}
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+972 XX-XXXX-XXX"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company" className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          {t('contact.company')}
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder={t('contact.company_placeholder')}
                        />
                      </div>
                    </div>

                    {/* Service Interest */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceInterest">{t('contact.service_interest')}</Label>
                      <select
                        id="serviceInterest"
                        name="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">{t('contact.service_interest_placeholder')}</option>
                        {services.map((service) => (
                          <option key={service.value} value={service.value}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {t('contact.subject')}
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder={t('contact.subject_placeholder')}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.message')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder={t('contact.message_placeholder')}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>{t('contact.sending')}</>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {t('contact.send_message')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
              
              {/* Contact Details */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-primary">
                     {t('contact.info_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{info.title}</h3>
                          <p className="text-sm font-medium text-primary">{info.details}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Services Quick Reference */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-primary">
                    {t('contact.our_services')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  {services.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span className="text-sm">{service.label}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card className="p-6 bg-primary/5">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-primary">
                    {t('common.why_choose_mt')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{t('common.official_partner')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{t('common.professional_training_programs')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{t('common.expert_wrapping_services')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{t('common.fast_response_time')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      {/* Map Section Placeholder */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
             <h2 className="text-3xl font-bold text-primary mb-4">{t('common.visit_our_location')}</h2>
             <p className="text-muted-foreground">
               {t('common.visit_showroom_workshop')}
             </p>
          </div>
          
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
               <h3 className="text-lg font-semibold mb-2">{t('contact.location_short')}</h3>
               <p className="text-muted-foreground">{t('contact.location_address')}</p>
               <p className="text-sm text-muted-foreground mt-2">{t('common.visit_us_location')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;