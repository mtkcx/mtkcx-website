import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Truck, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface MobileCheckoutProps {
  onBack: () => void;
}

export const MobileCheckout: React.FC<MobileCheckoutProps> = ({ onBack }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    city: '',
    address: '',
    location: '',
    paymentMethod: 'cash_on_delivery',
    orderNotes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    // Validate required fields
    if (!formData.email || !formData.fullName || !formData.phone || !formData.location) {
      toast({
        title: t('checkout.missing_info'),
        description: t('checkout.missing_info_desc'),
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const total = getTotalPrice();
      
      toast({
        title: t('checkout.order_success'),
        description: t('checkout.order_success_desc').replace('{total}', `₪${total.toLocaleString()}`),
      });

      // Clear cart and reset form
      clearCart();
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        city: '',
        address: '',
        location: '',
        paymentMethod: 'cash_on_delivery',
        orderNotes: ''
      });

      // Go back to previous screen after successful order
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error) {
      toast({
        title: t('checkout.order_failed'),
        description: t('checkout.order_failed_desc'),
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{t('checkout.title')}</h1>
        </div>

        <Card className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            </div>
            <h3 className="font-medium">{t('checkout.cart_empty')}</h3>
            <p className="text-sm text-muted-foreground">{t('checkout.cart_empty_desc')}</p>
            <Button onClick={onBack} className="w-full">
              {t('checkout.continue_shopping')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => `₪${price.toLocaleString()}`;
  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{t('checkout.title')}</h1>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-3 text-center">
          <Shield className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-xs font-medium">{t('checkout.secure_checkout')}</div>
          <div className="text-xs text-muted-foreground">{t('checkout.secure_checkout_desc')}</div>
        </Card>
        <Card className="p-3 text-center">
          <Truck className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-xs font-medium">{t('checkout.fast_delivery')}</div>
          <div className="text-xs text-muted-foreground">{t('checkout.fast_delivery_desc')}</div>
        </Card>
        <Card className="p-3 text-center">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-primary" />
          <div className="text-xs font-medium">{t('checkout.safe_payments')}</div>
          <div className="text-xs text-muted-foreground">{t('checkout.cash_on_delivery_trust_desc')}</div>
        </Card>
      </div>

      {/* Order Summary */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">{t('checkout.order_summary')}</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-start text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.productName}</div>
                <div className="text-muted-foreground">
                  {item.variantSize} • {t('checkout.quantity').replace('{quantity}', item.quantity.toString())}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPrice(item.price)} {t('checkout.each')}
                </div>
              </div>
            </div>
          ))}
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span>{t('checkout.subtotal')}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('checkout.shipping')}</span>
              <span>{t('checkout.shipping_free')}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2 mt-2">
              <span>{t('checkout.total')}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">{t('checkout.customer_info')}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('checkout.email')} <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('auth.enter_email')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">{t('checkout.full_name')} <span className="text-destructive">*</span></Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder={t('auth.enter_full_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('checkout.phone_number')} <span className="text-destructive">*</span></Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('auth.enter_phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('checkout.shipping_location')} <span className="text-destructive">*</span></Label>
            <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('checkout.select_location')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="west_bank">{t('checkout.location_west_bank')}</SelectItem>
                <SelectItem value="north">{t('checkout.location_north')}</SelectItem>
                <SelectItem value="south">{t('checkout.location_south')}</SelectItem>
                <SelectItem value="center">{t('checkout.location_center')}</SelectItem>
                <SelectItem value="jerusalem">{t('checkout.location_jerusalem')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('checkout.city')}</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder={t('profile.enter_city')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('checkout.address')}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder={t('profile.enter_address')}
            />
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">{t('checkout.payment_method')}</h3>
        <RadioGroup
          value={formData.paymentMethod}
          onValueChange={(value) => handleInputChange('paymentMethod', value)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
            <div className="flex-1">
              <Label htmlFor="cash_on_delivery" className="flex items-center gap-2 cursor-pointer">
                <Truck className="h-4 w-4" />
                <div>
                  <div className="font-medium">{t('checkout.cash_on_delivery')}</div>
                  <div className="text-sm text-muted-foreground">{t('checkout.cash_on_delivery_desc')}</div>
                </div>
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="credit_card_call" id="credit_card_call" />
            <div className="flex-1">
              <Label htmlFor="credit_card_call" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" />
                <div>
                  <div className="font-medium">{t('checkout.credit_card_manual')}</div>
                  <div className="text-sm text-muted-foreground">{t('checkout.credit_card_manual_desc')}</div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {formData.paymentMethod === 'credit_card_call' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">{t('checkout.credit_card_notice')}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Order Notes */}
      <Card className="p-4">
        <div className="space-y-2">
          <Label htmlFor="orderNotes">{t('checkout.order_notes')}</Label>
          <Textarea
            id="orderNotes"
            value={formData.orderNotes}
            onChange={(e) => handleInputChange('orderNotes', e.target.value)}
            placeholder={t('checkout.order_notes_placeholder')}
            rows={3}
          />
        </div>
      </Card>

      {/* Order Button */}
      <Card className="p-4">
        <Button
          onClick={handleSubmitOrder}
          disabled={isProcessing}
          className="w-full h-12 text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              {t('checkout.processing')}
            </div>
          ) : formData.paymentMethod === 'credit_card_call' ? (
            t('checkout.complete_order_credit_card')
          ) : (
            t('checkout.complete_order').replace('{total}', formatPrice(totalPrice))
          )}
        </Button>
        
        <div className="text-xs text-center text-muted-foreground mt-2">
          {t('checkout.terms_notice')}
        </div>
      </Card>
    </div>
  );
};