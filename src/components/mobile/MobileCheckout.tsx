import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Truck, Shield, Banknote, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MobileCheckoutProps {
  onBack: () => void;
  onPaymentSuccess?: () => void;
}

export const MobileCheckout: React.FC<MobileCheckoutProps> = ({ onBack, onPaymentSuccess }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || '',
    name: '',
    phone: '',
    address: '',
    city: '',
    location: '',
    notes: '',
    paymentMethod: 'cash_on_delivery', // Default payment method
  });
  
  const [shippingCost, setShippingCost] = useState(0);

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
    
    // Calculate shipping when location changes
    if (field === 'location') {
      calculateShipping(value);
    }
  };
  
  const calculateShipping = (location: string) => {
    const totalWeight = getTotalWeight();
    let baseShipping = 0;
    
    switch (location) {
      case 'west_bank':
        baseShipping = 30;
        break;
      case 'north':
      case 'south': 
      case 'center':
        baseShipping = 60;
        break;
      case 'jerusalem':
        baseShipping = 25;
        break;
      default:
        baseShipping = 0;
    }
    
    // Calculate weight multiplier (every 20kg doubles the cost)
    const weightMultiplier = Math.max(1, Math.ceil(totalWeight / 20));
    const finalShipping = baseShipping * weightMultiplier;
    
    setShippingCost(finalShipping);
  };
  
  const getTotalWeight = () => {
    return items.reduce((total, item) => {
      let itemWeight = 1; // Default 1kg
      
      if (item.variantSize) {
        const size = item.variantSize.toLowerCase();
        if (size.includes('20l') || size.includes('20kg')) itemWeight = 20;
        else if (size.includes('10l') || size.includes('10kg')) itemWeight = 10;
        else if (size.includes('5l') || size.includes('5kg')) itemWeight = 5;
        else if (size.includes('1l') || size.includes('1kg')) itemWeight = 1;
        else if (size.includes('750ml')) itemWeight = 0.75;
        else if (size.includes('500ml')) itemWeight = 0.5;
        else if (size.includes('250ml')) itemWeight = 0.25;
      }
      
      return total + (itemWeight * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.email || !customerInfo.name || !customerInfo.phone || !customerInfo.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const totalAmount = getTotalPrice() + shippingCost;
      
      // Create order using edge function
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: items.map(item => ({
            id: item.id,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            variantSize: item.variantSize,
            imageUrl: item.imageUrl
          })),
          customerInfo,
          shippingCost,
          totalAmount
        }
      });

      if (error) {
        console.error('❌ Order creation error:', error);
        throw new Error(error.message);
      }

      if (data?.success && data?.order) {
        console.log('✅ Order created successfully:', data.order);
        
        toast({
          title: "Order Successful!",
          description: `Order #${data.order.order_number} created successfully! ${formatPrice(totalAmount)}`,
        });
        
        clearCart();
        onPaymentSuccess?.();
      } else {
        throw new Error('Failed to create order');
      }
      
    } catch (error) {
      console.error('❌ Order placement error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Cart Empty</h1>
          <p className="text-muted-foreground">Your cart is empty. Add some products first.</p>
          <Button onClick={onBack}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      {/* Customer Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Method Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Shipping & Payment Notice</div>
                <div className="text-blue-700">
                  We'll contact you to arrange delivery and payment. Choose between cash on delivery or credit card payment by phone.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="location">Shipping Location <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="west_bank">West Bank - ₪30</SelectItem>
                  <SelectItem value="north">North Jerusalem - ₪60</SelectItem>
                  <SelectItem value="south">South Jerusalem - ₪60</SelectItem>
                  <SelectItem value="center">Central Jerusalem - ₪60</SelectItem>
                  <SelectItem value="jerusalem">Jerusalem - ₪25</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={customerInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Your city"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={customerInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Your full address"
            />
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Payment Method</Label>
            <div className="space-y-3">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  customerInfo.paymentMethod === 'cash_on_delivery' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleInputChange('paymentMethod', 'cash_on_delivery')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="cash_on_delivery"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={customerInfo.paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-primary"
                  />
                  <label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                    <div className="font-medium flex items-center">
                      <Banknote className="w-4 h-4 mr-2" />
                      Cash on Delivery
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Pay when your order arrives
                    </div>
                  </label>
                </div>
              </div>

              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  customerInfo.paymentMethod === 'credit_card' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleInputChange('paymentMethod', 'credit_card')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="credit_card"
                    name="paymentMethod"
                    value="credit_card"
                    checked={customerInfo.paymentMethod === 'credit_card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="text-primary"
                  />
                  <label htmlFor="credit_card" className="flex-1 cursor-pointer">
                    <div className="font-medium flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Credit Card (Phone)
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      We'll call you to process payment securely
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea
              id="notes"
              value={customerInfo.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special instructions or comments..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
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
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice() + shippingCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-xs font-medium mb-1">Secure Checkout</div>
          <div className="text-xs text-muted-foreground">Your data is protected</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <Truck className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-xs font-medium mb-1">Fast Delivery</div>
          <div className="text-xs text-muted-foreground">2-3 business days</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <Banknote className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-xs font-medium mb-1">Flexible Payment</div>
          <div className="text-xs text-muted-foreground">Cash or card options</div>
        </div>
      </div>

      {/* Place Order Button */}
      <Button 
        onClick={handlePlaceOrder}
        disabled={isProcessing || !customerInfo.email || !customerInfo.name || !customerInfo.phone || !customerInfo.location}
        className="w-full h-12 text-lg"
        size="lg"
      >
        {isProcessing ? (
          'Processing Order...'
        ) : (
          `Place Order - ${formatPrice(getTotalPrice() + shippingCost)}`
        )}
      </Button>
    </div>
  );
};