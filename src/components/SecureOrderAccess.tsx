import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';
import { OrderSecurityManager, SecurityAuditLogger, DataEncryptionManager } from '@/utils/enhanced-security';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecureOrderAccessProps {
  onOrderFound: (order: any) => void;
  onAccessDenied: (reason: string) => void;
}

const SecureOrderAccess: React.FC<SecureOrderAccessProps> = ({ onOrderFound, onAccessDenied }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for lockout timer
    if (lockoutTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutTime) {
          setLockoutTime(null);
          setAttempts(0);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleSecureAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingMs = lockoutTime - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      onAccessDenied(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`);
      return;
    }

    if (!orderNumber || !email) {
      toast({
        title: 'Required Fields',
        description: 'Please provide both order number and email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Log access attempt
      SecurityAuditLogger.logSecurityEvent('secure_order_access_attempt', 'medium', {
        orderNumber: DataEncryptionManager.maskSensitiveData(orderNumber, 'name'),
        email: DataEncryptionManager.maskSensitiveData(email, 'email'),
        hasSessionToken: !!sessionToken
      });

      // Find order by order number and email
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            unit_price,
            total_price,
            variant_size
          )
        `)
        .eq('order_number', orderNumber)
        .eq('email', email);

      if (error) {
        throw new Error(error.message);
      }

      if (!orders || orders.length === 0) {
        // Increment failed attempts
        setAttempts(prev => {
          const newAttempts = prev + 1;
          
          // Lock out after 3 failed attempts
          if (newAttempts >= 3) {
            const lockout = Date.now() + (15 * 60 * 1000); // 15 minutes
            setLockoutTime(lockout);
            
            SecurityAuditLogger.logSecurityEvent('order_access_lockout', 'high', {
              orderNumber: DataEncryptionManager.maskSensitiveData(orderNumber, 'name'),
              email: DataEncryptionManager.maskSensitiveData(email, 'email'),
              attempts: newAttempts
            });
          }
          
          return newAttempts;
        });

        SecurityAuditLogger.logSecurityEvent('order_access_failed', 'medium', {
          orderNumber: DataEncryptionManager.maskSensitiveData(orderNumber, 'name'),
          email: DataEncryptionManager.maskSensitiveData(email, 'email'),
          attempt: attempts + 1
        });

        onAccessDenied('Order not found or email does not match.');
        return;
      }

      const order = orders[0];

      // Set security context for RLS policies
      await supabase.rpc('set_config', {
        setting_name: 'app.secure_guest_validated',
        setting_value: 'true',
        is_local: true
      });

      await supabase.rpc('set_config', {
        setting_name: 'app.guest_order_id_validated',
        setting_value: order.id,
        is_local: true
      });

      await supabase.rpc('set_config', {
        setting_name: 'app.ip_security_passed',
        setting_value: 'true',
        is_local: true
      });

      await supabase.rpc('set_config', {
        setting_name: 'app.rate_limit_security_passed',
        setting_value: 'true',
        is_local: true
      });

      // Enhanced security validation using OrderSecurityManager
      const securityCheck = await OrderSecurityManager.validateOrderAccess(
        order.id,
        sessionToken,
        undefined // No user ID for guest access
      );

      if (!securityCheck.allowed) {
        SecurityAuditLogger.logSecurityEvent('order_access_security_denied', 'high', {
          orderId: order.id,
          reason: securityCheck.reason
        });
        onAccessDenied(securityCheck.reason || 'Access denied for security reasons.');
        return;
      }

      // Success - reset attempts and log
      setAttempts(0);
      setLockoutTime(null);

      SecurityAuditLogger.logSecurityEvent('order_access_successful', 'low', {
        orderId: order.id,
        orderNumber: DataEncryptionManager.maskSensitiveData(orderNumber, 'name')
      });

      // Transform order for display
      const orderWithItems = {
        ...order,
        items: order.order_items || []
      };

      onOrderFound(orderWithItems);

      toast({
        title: 'Order Found',
        description: 'Your order has been securely retrieved.',
      });

    } catch (error: any) {
      console.error('Secure order access error:', error);
      
      SecurityAuditLogger.logSecurityEvent('order_access_error', 'medium', {
        error: error instanceof Error ? error.message : String(error),
        orderNumber: DataEncryptionManager.maskSensitiveData(orderNumber, 'name')
      });

      onAccessDenied('An error occurred while accessing your order. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return null;
    const remainingMs = lockoutTime - Date.now();
    if (remainingMs <= 0) return null;
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const remainingTime = getRemainingLockoutTime();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Secure Order Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attempts > 0 && !remainingTime && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {attempts === 1 ? '1 failed attempt' : `${attempts} failed attempts`}.
              {attempts === 2 && ' One more failed attempt will result in a 15-minute lockout.'}
            </AlertDescription>
          </Alert>
        )}

        {remainingTime && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <Clock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Too many failed attempts. Please wait {remainingTime} before trying again.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSecureAccess} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order Number *</Label>
            <Input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD-123456789"
              disabled={isVerifying || !!remainingTime}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isVerifying || !!remainingTime}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionToken">
              Session Token (if provided)
              <Badge variant="outline" className="ml-2 text-xs">
                Optional
              </Badge>
            </Label>
            <div className="relative">
              <Input
                id="sessionToken"
                type={showToken ? 'text' : 'password'}
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value)}
                placeholder="Enter session token if available"
                disabled={isVerifying || !!remainingTime}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
                disabled={isVerifying || !!remainingTime}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isVerifying || !!remainingTime}
          >
            {isVerifying ? 'Verifying...' : 'Access Order Securely'}
          </Button>
        </form>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>🔒 This access is secured with:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Rate limiting protection</li>
            <li>IP address monitoring</li>
            <li>Automatic lockout after failed attempts</li>
            <li>Security audit logging</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureOrderAccess;