import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert enrollment request
      const { error: insertError } = await supabase
        .from('enrollment_requests')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course_type: 'professional_detailing'
        });

      if (insertError) throw insertError;

      // Send enrollment confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-enrollment-confirmation', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }
      });

      if (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't throw error here as the enrollment was successful
      }

      toast({
        title: "Request Submitted!",
        description: "Thank you for your interest! We'll contact you within 24 hours about the Koch Chemie Professional Detailing & Polishing Certification.",
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
            Course Enrollment Request
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Fill out your information and we'll contact you within 24 hours
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