import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, User, Mail, Phone } from 'lucide-react';

interface MobileEnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileEnrollmentDialog: React.FC<MobileEnrollmentDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course_type: 'professional_detailing'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: t('mobile.enrollment.missing_info'),
        description: t('mobile.enrollment.fill_required'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the secure enrollment edge function
      const { data, error } = await supabase.functions.invoke('secure-enrollment', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          course_type: formData.course_type
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('mobile.enrollment.success'),
        description: t('mobile.enrollment.success_desc'),
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        email: '',
        phone: '',
        course_type: 'professional_detailing'
      });
      onClose();

    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: t('mobile.enrollment.failed'),
        description: error.message || t('mobile.enrollment.error_desc'),
        variant: "destructive",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('mobile.enrollment.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('mobile.enrollment.full_name')} *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('auth.enter_full_name')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('mobile.enrollment.email')} *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('auth.enter_email')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t('mobile.enrollment.phone')} *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('auth.enter_phone')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_type">{t('mobile.enrollment.course_type')}</Label>
            <Select
              value={formData.course_type}
              onValueChange={(value) => handleInputChange('course_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('mobile.enrollment.course_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional_detailing">{t('mobile.enrollment.professional_detailing')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('mobile.enrollment.single_course_note')}
            </p>
          </div>

          <DialogFooter className="flex-col space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('mobile.enrollment.submitting') : t('mobile.enrollment.submit')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};