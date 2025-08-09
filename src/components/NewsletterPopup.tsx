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
  
  // Rate limiting hook
  const { checkRateLimit, isLimited, getRemainingTime } = useRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    storageKey: 'newsletter-signup-attempts'
  });

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('newsletter-popup-seen');
    
    if (!hasSeenPopup) {
      // Show popup after 2 seconds delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
    // Check rate limiting
    if (!checkRateLimit()) {
      const remainingTime = getRemainingTime();
      const minutes = Math.ceil(remainingTime / (60 * 1000));
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${minutes} minutes before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    // Sanitize and validate inputs
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
        description: 'Please enter a valid name (2-100 characters, letters only)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate verification token
      const verificationToken = generateVerificationToken();
      
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({ 
          email: sanitizedEmail, 
          name: sanitizedName || null,
          source: 'popup',
          verification_token: verificationToken
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Already Subscribed',
            description: 'You are already subscribed to our newsletter!',
            variant: 'default',
          });
        } else {
          throw error;
        }
      } else {
        // Send verification email
        await supabase.functions.invoke('send-newsletter-verification', {
          body: { 
            email: sanitizedEmail, 
            name: sanitizedName || 'Valued Customer',
            verificationToken 
          }
        });

        toast({
          title: 'Verification Email Sent!',
          description: 'Please check your email and click the verification link to complete your subscription.',
          variant: 'default',
        });
      }

      // Mark popup as seen and close
      localStorage.setItem('newsletter-popup-seen', 'true');
      setIsOpen(false);
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
    localStorage.setItem('newsletter-popup-seen', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            Stay Updated!
          </DialogTitle>
          <p className="text-muted-foreground">
            Subscribe to our newsletter and get the latest updates, exclusive offers, and industry insights delivered to your inbox.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="popup-name" className="text-sm font-medium">
              Name (Optional)
            </Label>
            <Input
              id="popup-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="popup-email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="popup-email"
              type="email"
              placeholder="Enter your email"
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
              {isLoading ? 'Subscribing...' : 'Subscribe Now'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;