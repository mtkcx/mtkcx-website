import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const SecureNewsletterVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { isRTL } = useLanguage();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        // Call the secure verification edge function
        const { data, error } = await supabase.functions.invoke('verify-newsletter-subscription', {
          body: { token }
        });

        if (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          setMessage('Verification failed. Please try again or contact support.');
          toast.error('Failed to verify your subscription');
          return;
        }

        if (data.success) {
          setVerificationStatus('success');
          setMessage('Your newsletter subscription has been successfully verified!');
          toast.success('Newsletter subscription verified successfully!');
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Verification failed. The link may be expired or invalid.');
          toast.error(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred');
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Newsletter Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <p>Verifying your subscription...</p>
                </>
              )}
              
              {verificationStatus === 'success' && (
                <>
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                  <p className="text-green-600 font-medium">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    You will now receive our newsletter updates.
                  </p>
                </>
              )}
              
              {verificationStatus === 'error' && (
                <>
                  <XCircle className="w-12 h-12 mx-auto text-red-500" />
                  <p className="text-red-600 font-medium">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    If you continue to have issues, please contact our support team.
                  </p>
                </>
              )}
              
              <Button onClick={handleGoHome} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecureNewsletterVerification;