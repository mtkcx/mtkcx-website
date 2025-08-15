
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRateLimit } from '@/hooks/useRateLimit';
import { sanitizeInput, validateEmail, validateName, generateVerificationToken } from '@/utils/security';

const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Rate limiting for newsletter signups
  const { checkRateLimit, isLimited, getRemainingTime } = useRateLimit({
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000, // 15 minutes
    storageKey: 'newsletter-signup-limit'
  });

  useEffect(() => {
    // Check if user has dismissed the popup in this session
    const hasSeenPopup = sessionStorage.getItem('newsletter-popup-dismissed');
    
    if (!hasSeenPopup) {
      // Show popup after 2 seconds delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
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
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedName = name ? sanitizeInput(name) : '';

    if (!sanitizedEmail) {
      toast({
        title: t('common.error'),
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: t('common.error'),
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (sanitizedName && !validateName(sanitizedName)) {
      toast({
        title: t('common.error'),
        description: 'Please enter a valid name (letters and spaces only)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the secure newsletter signup function
      const { data, error } = await supabase.functions.invoke('secure-newsletter-signup', {
        body: {
          email: sanitizedEmail,
          name: sanitizedName || null
        }
      });

      if (error) {
        console.error('Newsletter subscription error:', error);
        toast({
          title: t('common.error'),
          description: 'Failed to subscribe. Please try again later.',
          variant: 'destructive',
        });
        return;
      }

      if (data.success) {
        toast({
          title: 'Verification Email Sent!',
          description: data.message,
          variant: 'default',
        });
        
        // Mark popup as dismissed for this session and close
        sessionStorage.setItem('newsletter-popup-dismissed', 'true');
        setIsOpen(false);
      } else {
        toast({
          title: t('common.error'),
          description: data.message || 'Subscription failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to subscribe. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Mark popup as dismissed for this session
    sessionStorage.setItem('newsletter-popup-dismissed', 'true');
    setIsOpen(false);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-border">
            <img 
              src="/lovable-uploads/23f813bc-cb98-4a51-a3df-e4bd62311e7d.png" 
              alt="MT KCx Logo" 
              className="w-16 h-12 object-contain"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t('newsletter.title')}
          </DialogTitle>
          <p className="text-muted-foreground">
            {t('newsletter.description')}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="popup-name" className="text-sm font-medium">
              {t('newsletter.name')}
            </Label>
            <Input
              id="popup-name"
              type="text"
              placeholder={t('newsletter.name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="popup-email" className="text-sm font-medium">
              {t('newsletter.email')}
            </Label>
            <Input
              id="popup-email"
              type="email"
              placeholder={t('newsletter.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? t('newsletter.subscribing') : t('newsletter.subscribe')}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {t('newsletter.maybe_later')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('newsletter.privacy')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
