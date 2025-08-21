import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useRateLimit } from '@/hooks/useRateLimit';
import { sanitizeInput, validateEmail, validateName, validatePhone } from '@/utils/security';

interface EnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnrollmentDialog: React.FC<EnrollmentDialogProps> = ({ isOpen, onClose }) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Rate limiting for enrollment submissions - more lenient for better UX
  const { checkRateLimit, isLimited, getRemainingTime } = useRateLimit({
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    storageKey: 'enrollment-submit-limit'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit()) {
      const remainingTime = Math.ceil(getRemainingTime() / 1000 / 60);
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${remainingTime} minutes before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    // Input validation and sanitization
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email.toLowerCase());
    const sanitizedPhone = sanitizeInput(formData.phone);
    
    if (!sanitizedName || !sanitizedEmail || !sanitizedPhone) {
      toast({
        title: t('common.error'),
        description: t('enrollment.fill_all_fields'),
        variant: "destructive"
      });
      return;
    }

    // Friendly guidance instead of strict validation
    if (sanitizedName.length < 2) {
      toast({
        title: t('enrollment.name_guidance'),
        description: 'Please enter your full name for better service',
        variant: "default"
      });
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: t('common.error'),
        description: 'Please enter a valid email address',
        variant: "destructive"
      });
      return;
    }

    if (!validatePhone(sanitizedPhone)) {
      toast({
        title: t('common.error'),
        description: 'Please enter a valid phone number',
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use secure enrollment endpoint instead of direct database insertion
      const { data, error } = await supabase.functions.invoke('secure-enrollment', {
        body: {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          course_type: 'professional_detailing'
        }
      });

      if (error) {
        console.error('Enrollment error:', error);
        throw new Error(error.message || 'Failed to submit enrollment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to submit enrollment');
      }

      toast({
        title: t('enrollment.success_title'),
        description: t('enrollment.success_message'),
        variant: "default"
      });

      // Reset form and close dialog
      setFormData({ name: '', email: '', phone: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      toast({
        title: t('common.error'),
        description: t('enrollment.error_message'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('enrollment.dialog_title')}
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm mt-2">
            {t('enrollment.dialog_subtitle')}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('enrollment.name')}</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('enrollment.name_placeholder')}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('enrollment.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('enrollment.email_placeholder')}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t('enrollment.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('enrollment.phone_placeholder')}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? t('enrollment.submitting') : t('enrollment.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;