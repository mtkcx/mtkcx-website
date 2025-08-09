import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRateLimit } from '@/hooks/useRateLimit';
import { sanitizeInput } from '@/utils/security';

interface QuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string;
}

const QuoteDialog: React.FC<QuoteDialogProps> = ({ isOpen, onClose, serviceType }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: serviceType || '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { checkRateLimit, isLimited, getRemainingTime } = useRateLimit({
    maxAttempts: 2,
    windowMs: 300000, // 5 minutes
    storageKey: 'quote-submission'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: t('auth.error_title'),
        description: t('auth.required_fields'),
        variant: 'destructive'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: t('auth.error_title'),
        description: t('auth.invalid_email'),
        variant: 'destructive'
      });
      return;
    }

    // Rate limiting check
    if (!checkRateLimit()) {
      toast({
        title: t('auth.error_title'),
        description: t('common.rate_limit_exceeded').replace('{time}', Math.ceil(getRemainingTime() / 60000).toString()),
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        service: sanitizeInput(formData.service),
        message: sanitizeInput(formData.message)
      };

      const { error } = await supabase
        .from('quotes')
        .insert({
          user_id: user?.id || null,
          service_type: sanitizedData.service || t('gallery.vehicle_wrapping_services'),
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          message: sanitizedData.message,
          status: 'pending'
        });

      if (error) {
        console.error('Quote submission error:', error);
        toast({
          title: t('dashboard.error'),
          description: t('auth.something_went_wrong'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('common.quote_request_received'),
        description: t('common.contact_service_hours').replace('{service}', sanitizedData.service || t('gallery.vehicle_wrapping_services'))
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: serviceType || '',
        message: ''
      });
      onClose();

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: t('dashboard.error'),
        description: t('auth.something_went_wrong'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {t('quote.request_title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote-name">{t('contact.name')}</Label>
            <Input
              id="quote-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('contact.name_placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-email">{t('contact.email')}</Label>
            <Input
              id="quote-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('contact.email_placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-phone">{t('contact.phone')}</Label>
            <Input
              id="quote-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('contact.phone_placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-service">{t('contact.service_interest')}</Label>
            <Input
              id="quote-service"
              type="text"
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              placeholder={t('quote.service_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-message">{t('quote.message_label')}</Label>
            <Textarea
              id="quote-message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={t('quote.message_placeholder')}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('quote.submitting') : t('quote.submit_request')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDialog;