import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const VerifyNewsletter = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifySubscription = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        // Find and verify the subscription
        const { data: subscription, error: fetchError } = await supabase
          .from('newsletter_subscriptions')
          .select('*')
          .eq('verification_token', token)
          .is('verified_at', null)
          .single();

        if (fetchError || !subscription) {
          setVerificationStatus('error');
          setMessage('Invalid or expired verification link.');
          return;
        }

        // Check if token has expired (24 hours)
        const tokenAge = Date.now() - new Date(subscription.created_at).getTime();
        if (tokenAge > 24 * 60 * 60 * 1000) {
          setVerificationStatus('error');
          setMessage('Verification link has expired. Please subscribe again.');
          return;
        }

        // Update subscription to verified
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({ 
            verified_at: new Date().toISOString(),
            verification_token: null 
          })
          .eq('id', subscription.id);

        if (updateError) {
          throw updateError;
        }

        // Send welcome email
        await supabase.functions.invoke('send-welcome-email', {
          body: { 
            email: subscription.email, 
            name: subscription.name || 'Valued Customer' 
          }
        });

        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! Welcome to our newsletter.');
        
        toast({
          title: 'Email Verified!',
          description: 'You have successfully subscribed to our newsletter.',
          variant: 'default',
        });

      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifySubscription();
  }, [searchParams, toast]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Newsletter Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Verifying your email address...</p>
                </>
              )}

              {verificationStatus === 'success' && (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Verification Successful!</h3>
                    <p className="text-muted-foreground">{message}</p>
                  </div>
                </>
              )}

              {verificationStatus === 'error' && (
                <>
                  <XCircle className="h-12 w-12 mx-auto text-red-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Verification Failed</h3>
                    <p className="text-muted-foreground">{message}</p>
                  </div>
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

export default VerifyNewsletter;