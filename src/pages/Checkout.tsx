import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Truck, Shield, Banknote } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || '',
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash_on_delivery'>('credit_card');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(price);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.email || !customerInfo.name || !customerInfo.phone) {
      toast({
        title: t('checkout.missing_info'),
        description: t('checkout.missing_info_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Here you would integrate with your payment system
      // For now, we'll simulate the process
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t('checkout.order_success'),
        description: t('checkout.order_success_desc').replace('{total}', formatPrice(getTotalPrice())),
      });
      
      clearCart();
      navigate('/payment-success');
      
    } catch (error) {
      toast({
        title: t('checkout.order_failed'),
        description: t('checkout.order_failed_desc'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">{t('checkout.cart_empty')}</h1>
            <p className="text-muted-foreground">{t('checkout.cart_empty_desc')}</p>
            <Button onClick={() => navigate('/products')}>
              {t('checkout.continue_shopping')}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('checkout.back_to_products')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('checkout.customer_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>{t('checkout.payment_method')} {t('checkout.required_field')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'credit_card' 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentMethod('credit_card')}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('checkout.credit_card')}</div>
                          <div className="text-sm text-muted-foreground">{t('checkout.credit_card_desc')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery' 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentMethod('cash_on_delivery')}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('checkout.cash_on_delivery')}</div>
                          <div className="text-sm text-muted-foreground">{t('checkout.cash_on_delivery_desc')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium text-blue-900 mb-1">{t('checkout.shipping_notice_title')}</div>
                          <div className="text-blue-700">
                            {t('checkout.shipping_notice_desc')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t('checkout.email')} {t('checkout.required_field')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">{t('checkout.full_name')} {t('checkout.required_field')}</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t('checkout.phone_number')} {t('checkout.required_field')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+972-XX-XXX-XXXX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">{t('checkout.city')}</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Your city"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">{t('checkout.address')}</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Your full address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">{t('checkout.order_notes')}</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={t('checkout.order_notes_placeholder')}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{t('checkout.secure_checkout')}</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{t('checkout.fast_delivery')}</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">{t('checkout.safe_payments')}</div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.order_summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.productName}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.variantSize}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('checkout.quantity').replace('{quantity}', item.quantity.toString())}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(item.price)} {t('checkout.each')}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('checkout.subtotal')}</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('checkout.shipping')}</span>
                    <span className="text-muted-foreground">
                      {paymentMethod === 'cash_on_delivery' ? t('checkout.shipping_tba') : t('checkout.shipping_free')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('checkout.total')}</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? t('checkout.processing') : 
                   paymentMethod === 'cash_on_delivery' 
                     ? t('checkout.complete_order').replace('{total}', formatPrice(getTotalPrice()))
                     : t('checkout.pay_now').replace('{total}', formatPrice(getTotalPrice()))
                  }
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  {t('checkout.terms_notice')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;