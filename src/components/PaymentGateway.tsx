import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ShoppingCart, Calendar, User, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export type PaymentItem = {
  product_id?: string;
  variant_id?: string;
  product_name: string;
  variant_size?: string;
  quantity: number;
  unit_price: number;
};

export type ServiceDetails = {
  service_type: string;
  service_description: string;
  preferred_date?: string;
};

interface PaymentGatewayProps {
  items: PaymentItem[];
  serviceDetails?: ServiceDetails;
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentCancel?: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  items,
  serviceDetails,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paypal'>('stripe');
  
  // Customer form state
  const [customerDetails, setCustomerDetails] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: 'Jerusalem',
    country: 'Israel',
  });
  
  const [notes, setNotes] = useState('');

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const currency = 'ILS';

  const handlePayment = async (gateway: 'stripe' | 'paypal') => {
    if (!customerDetails.email || !customerDetails.name) {
      toast({
        title: t('common.error'),
        description: 'Please fill in all required fields (Name and Email)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const paymentData = {
        items,
        service_details: serviceDetails,
        customer_details: customerDetails,
        currency,
        notes: notes || undefined,
      };

      const functionName = gateway === 'stripe' ? 'create-stripe-payment' : 'create-paypal-payment';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: paymentData,
      });

      if (error) {
        console.error(`❌ ${gateway} payment error:`, error);
        throw new Error(error.message || `${gateway} payment failed`);
      }

      if (!data?.url) {
        throw new Error('No payment URL received');
      }

      // Open payment page in new tab for better UX
      window.open(data.url, '_blank');
      
      toast({
        title: 'Payment Initiated',
        description: `${gateway === 'stripe' ? 'Stripe' : 'PayPal'} checkout opened in a new tab. Please complete your payment there.`,
      });

      if (onPaymentSuccess && data.order_id) {
        onPaymentSuccess(data.order_id);
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.product_name}</p>
                {item.variant_size && (
                  <p className="text-sm text-muted-foreground">Size: {item.variant_size}</p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">₪{(item.unit_price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          {serviceDetails && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{serviceDetails.service_type} Service</p>
                  <p className="text-sm text-muted-foreground">{serviceDetails.service_description}</p>
                  {serviceDetails.preferred_date && (
                    <p className="text-sm text-muted-foreground">
                      Preferred Date: {new Date(serviceDetails.preferred_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">Custom Quote</Badge>
              </div>
            </div>
          )}
          
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span>₪{totalAmount.toFixed(2)} {currency}</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+972-XX-XXX-XXXX"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={customerDetails.city}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Jerusalem"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              value={customerDetails.address}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or comments..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe Payment */}
            <Button
              variant={selectedGateway === 'stripe' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setSelectedGateway('stripe')}
              disabled={isLoading}
            >
              <CreditCard className="w-8 h-8" />
              <div className="text-center">
                <p className="font-medium">Credit Card</p>
                <p className="text-xs opacity-70">Powered by Stripe</p>
              </div>
            </Button>

            {/* PayPal Payment */}
            <Button
              variant={selectedGateway === 'paypal' ? 'default' : 'outline'}
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setSelectedGateway('paypal')}
              disabled={isLoading}
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                PP
              </div>
              <div className="text-center">
                <p className="font-medium">PayPal</p>
                <p className="text-xs opacity-70">Safe & Secure</p>
              </div>
            </Button>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              size="lg"
              onClick={() => handlePayment(selectedGateway)}
              disabled={isLoading || !customerDetails.email || !customerDetails.name}
              className="w-full"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  {selectedGateway === 'stripe' ? (
                    <CreditCard className="w-5 h-5 mr-2" />
                  ) : (
                    <div className="w-5 h-5 mr-2 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                      PP
                    </div>
                  )}
                  Pay ₪{totalAmount.toFixed(2)} with {selectedGateway === 'stripe' ? 'Stripe' : 'PayPal'}
                </>
              )}
            </Button>

            {onPaymentCancel && (
              <Button variant="outline" onClick={onPaymentCancel}>
                Cancel
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>🔒 Your payment information is secure and encrypted</p>
            <p>💳 We support all major credit cards and PayPal</p>
            <p>🇮🇱 Optimized for Israeli customers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};