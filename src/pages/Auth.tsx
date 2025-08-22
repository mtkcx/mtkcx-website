import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { PasswordSecurityManager, SecurityAuditLogger } from '@/utils/enhanced-security';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    company: ''
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: t('auth.error_title'),
        description: t('auth.required_fields'),
        variant: 'destructive',
      });
      return false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: t('auth.error_title'),
        description: t('auth.invalid_email'),
        variant: 'destructive',
      });
      return false;
    }

    // Enhanced password validation for signup
    if (isSignUp) {
      const passwordValidation = PasswordSecurityManager.validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        toast({
          title: t('auth.error_title'),
          description: 'Password does not meet security requirements. Please check the requirements below.',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      // Minimum validation for signin
      if (formData.password && formData.password.length < 6) {
        toast({
          title: t('auth.error_title'),
          description: t('auth.password_too_short'),
          variant: 'destructive',
        });
        return false;
      }
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast({
        title: t('auth.error_title'),
        description: t('auth.passwords_dont_match'),
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.hostname === 'localhost' 
            ? 'https://lovely-salamander-a3df8b.netlify.app/' 
            : `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast({
          title: t('auth.error_title'),
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: t('auth.error_title'),
        description: error instanceof Error ? error.message : t('auth.something_went_wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Scroll to top when switching to sign up
    if (isSignUp) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Log signup attempt
        SecurityAuditLogger.logSecurityEvent('user_signup_attempt', 'low', {
          email: formData.email.substring(0, 3) + '***'
        });

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          SecurityAuditLogger.logSecurityEvent('user_signup_failed', 'medium', {
            email: formData.email.substring(0, 3) + '***',
            error: error.message
          });

          if (error.message.includes('already registered') || 
              error.message.includes('already exists') ||
              error.message.includes('duplicate') ||
              error.message.includes('User already registered')) {
            toast({
              title: t('auth.error_title'),
              description: 'An account with this email already exists. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: t('auth.error_title'),
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          SecurityAuditLogger.logSecurityEvent('user_signup_successful', 'low', {
            email: formData.email.substring(0, 3) + '***'
          });

          toast({
            title: t('auth.success_title'),
            description: 'Account created successfully! You can now sign in to your account.',
          });
          // Switch to sign in mode after successful signup
          setIsSignUp(false);
          setFormData({
            email: formData.email,
            password: '',
            confirmPassword: '',
            fullName: '',
            phone: '',
            company: ''
          });
        }
      } else {
        // Log signin attempt
        SecurityAuditLogger.logSecurityEvent('user_signin_attempt', 'low', {
          email: formData.email.substring(0, 3) + '***'
        });

        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          SecurityAuditLogger.logSecurityEvent('user_signin_failed', 'medium', {
            email: formData.email.substring(0, 3) + '***',
            error: error.message
          });

          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: t('auth.error_title'),
              description: t('auth.invalid_credentials'),
              variant: 'destructive',
            });
          } else {
            toast({
              title: t('auth.error_title'),
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          SecurityAuditLogger.logSecurityEvent('user_signin_successful', 'low', {
            email: formData.email.substring(0, 3) + '***'
          });

          toast({
            title: t('auth.success_title'),
            description: t('auth.signin_success'),
          });
          // Navigation will happen automatically via useEffect
        }
      }
    } catch (error: any) {
      toast({
        title: t('auth.error_title'),
        description: error instanceof Error ? error.message : t('auth.something_went_wrong'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 px-4 py-2">
              {t('auth.welcome_badge')}
            </Badge>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {isSignUp ? t('auth.create_account') : t('auth.welcome_back')}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? t('auth.create_account_desc') : t('auth.signin_desc')}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp ? t('auth.sign_up') : t('auth.sign_in')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Google OAuth Button */}
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full relative h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('auth.full_name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder={t('auth.enter_full_name')}
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')} *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('auth.enter_email')}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')} *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.enter_password')}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Password Strength Indicator for signup */}
                  {isSignUp && formData.password && (
                    <div className="mt-2">
                      <PasswordStrengthIndicator password={formData.password} />
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirm_password')} *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={t('auth.confirm_password_placeholder')}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                )}

                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phone')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder={t('auth.enter_phone')}
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">{t('auth.company')}</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          placeholder={t('auth.enter_company')}
                          value={formData.company}
                          onChange={handleInputChange}
                          className="pl-10"
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (isSignUp ? t('auth.creating_account') : t('auth.signing_in'))
                    : (isSignUp ? t('auth.create_account') : t('auth.sign_in'))
                  }
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? t('auth.already_have_account') : t('auth.dont_have_account')}
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setFormData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      fullName: '',
                      phone: '',
                      company: ''
                    });
                  }}
                  className="p-0 h-auto"
                >
                  {isSignUp ? t('auth.sign_in_here') : t('auth.sign_up_here')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;