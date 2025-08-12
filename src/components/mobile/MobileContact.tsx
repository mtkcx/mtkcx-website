import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  CheckCircle,
  ArrowLeft,
  Menu, 
  Globe,
  Home,
  ShoppingBag,
  BookOpen,
  MessageCircle,
  User as UserIcon
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import CartButton from '@/components/CartButton';

interface MobileContactProps {
  onBack: () => void;
  onTabSwitch: (tab: string) => void;
  onShowAbout: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  currentLanguage: string;
  handleLanguageChange: (lang: string) => void;
  menuItems: Array<{
    icon: any;
    label: string;
    action: () => void;
  }>;
}

export const MobileContact: React.FC<MobileContactProps> = ({ 
  onBack, 
  onTabSwitch, 
  onShowAbout, 
  isMenuOpen, 
  setIsMenuOpen, 
  currentLanguage, 
  handleLanguageChange, 
  menuItems 
}) => {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { user, profile, isAdmin } = useAuth();
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
      details: "Atarot, Jerusalem",
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
      {/* Header with Menu */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          {/* Hamburger Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/d780ca10-1c5a-4f83-bbf2-ff0e6949ad40.png" 
                    alt="MTKCx Logo"
                    className="h-12 w-auto"
                  />
                  {t('common.menu')}
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                {/* Language Selector */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('common.language')}</span>
                  </div>
                  <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="he">עברית</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          item.action();
                          setIsMenuOpen(false);
                        }}
                      >
                        <IconComponent className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo - Clickable */}
          <img 
            src="/lovable-uploads/d780ca10-1c5a-4f83-bbf2-ff0e6949ad40.png" 
            alt="MTKCx Logo" 
            className="h-20 w-auto cursor-pointer"
            onClick={() => {
              onTabSwitch('home');
              window.scrollTo(0, 0);
            }}
          />

          {/* Cart Button */}
          <div className="relative">
            <CartButton />
        </div>
      </div>
    </div>

      <div className="max-w-md mx-auto space-y-6 p-4">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {t('contact.badge')}
          </Badge>
          <h1 className="text-2xl font-bold">{t('contact.title')}</h1>
          <p className="text-muted-foreground">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('contact.form_title')}</CardTitle>
            <CardDescription>
              {t('contact.form_subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
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
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
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

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
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

              <div className="space-y-2">
                <Label htmlFor="subject" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
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

              <div className="space-y-2">
                <Label htmlFor="message">{t('contact.message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder={t('contact.message_placeholder')}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>{t('contact.sending')}</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t('contact.send_message')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('contact.info_title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-4 h-4 text-primary" />
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

        {/* Why Choose Us */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary">
              {t('common.why_choose_mt')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-5 bg-transparent h-16">
          <Button 
            variant="ghost"
            className="flex-col gap-1 h-full rounded-none"
            onClick={() => onTabSwitch('home')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">{t('nav.home')}</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex-col gap-1 h-full rounded-none"
            onClick={() => onTabSwitch('products')}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs">{t('nav.products')}</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex-col gap-1 h-full rounded-none"
            onClick={() => onTabSwitch('courses')}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">{t('nav.courses')}</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex-col gap-1 h-full rounded-none bg-primary/10"
          >
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-xs text-primary">{t('nav.contact')}</span>
          </Button>
          
          <Button 
            variant="ghost"
            className="flex-col gap-1 h-full rounded-none"
            onClick={() => onTabSwitch('dashboard')}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-xs truncate w-full px-1">
              {isAdmin ? 'Admin' : (profile?.full_name || user?.email?.split('@')[0] || t('nav.profile'))}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};