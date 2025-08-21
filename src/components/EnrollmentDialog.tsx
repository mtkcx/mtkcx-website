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
    phone: '',
    city: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('secure-enrollment', {
        body: {
          name: formData.name || 'Customer',
          email: formData.email || 'customer@example.com',
          phone: formData.phone || '000-000-0000',
          city: formData.city || 'Not specified',
          course_type: 'professional_detailing'
        }
      });

      // Enrollment submitted successfully
      
      toast({
        title: t('enrollment.success_title'),
        description: t('enrollment.success_message'),
        variant: "default"
      });

      // Reset form and close dialog
      setFormData({ name: '', email: '', phone: '', city: '' });
      onClose();
    } catch (error) {
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('enrollment.email')}</Label>
            <Input
              id="email"
              type="text"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('enrollment.email_placeholder')}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t('enrollment.phone')}</Label>
            <Input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('enrollment.phone_placeholder')}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('enrollment.city')}</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder={t('enrollment.city_placeholder')}
              disabled={isSubmitting}
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