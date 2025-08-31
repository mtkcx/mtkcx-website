import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Shield, Package, Calendar, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecureOrderAccess from '@/components/SecureOrderAccess';
import { DataEncryptionManager } from '@/utils/enhanced-security';

const SecureOrderLookup = () => {
  const [order, setOrder] = useState<{
    id: string;
    order_number: string;
    amount: number;
    status: string;
    items: any[];
    customer_name?: string;
    customer_email?: string;
    email?: string;
    created_at: string;
    payment_gateway?: string;
    order_type?: string;
    service_type?: string;
    service_description?: string;
    preferred_date?: string;
    customer_phone?: string;
    customer_address?: string;
    customer_city?: string;
    currency?: string;
  } | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  const handleOrderFound = (foundOrder: any) => {
    setOrder(foundOrder);
    setAccessDenied(null);
  };

  const handleAccessDenied = (reason: string) => {
    setAccessDenied(reason);
    setOrder(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-primary mb-4">
              <Shield className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Secure Order Lookup</h1>
            <p className="text-xl text-muted-foreground">
              Access your order information securely with enhanced protection
            </p>
          </div>

          {!order && !accessDenied && (
            <div className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  This secure lookup system includes IP monitoring, rate limiting, and automatic 
                  lockout protection to safeguard your order information.
                </AlertDescription>
              </Alert>

              <SecureOrderAccess 
                onOrderFound={handleOrderFound}
                onAccessDenied={handleAccessDenied}
              />
            </div>
          )}

          {accessDenied && (
            <div className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {accessDenied}
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Button
                  onClick={() => {
                    setAccessDenied(null);
                    setOrder(null);
                  }}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Order successfully retrieved with secure access validation.
                </AlertDescription>
              </Alert>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Details
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-medium">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{order.payment_gateway}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg">₪{order.amount.toFixed(2)} {order.currency || 'ILS'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {order.order_type === 'service' && order.service_type && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">Service Details</p>
                      <p className="font-medium">{order.service_type}</p>
                      {order.service_description && (
                        <p className="text-sm text-muted-foreground mt-1">{order.service_description}</p>
                      )}
                      {order.preferred_date && (
                        <p className="text-sm text-muted-foreground">
                          Preferred Date: {new Date(order.preferred_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">Order Items</p>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
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
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information (masked for security) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{DataEncryptionManager.maskSensitiveData(order.customer_name, 'name')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{DataEncryptionManager.maskSensitiveData(order.customer_email || order.email, 'email')}</span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{DataEncryptionManager.maskSensitiveData(order.customer_phone, 'phone')}</span>
                      </div>
                    )}
                    {order.customer_address && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>Address on file</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    * Personal information is masked for security purposes
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Shield className="w-5 h-5" />
                    Security Notice
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 text-sm">
                  <p>
                    This order was accessed securely with the following protections:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>IP address validation and monitoring</li>
                    <li>Rate limiting and automatic lockout protection</li>
                    <li>Security audit logging</li>
                    <li>Personal information masking</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    setOrder(null);
                    setAccessDenied(null);
                  }}
                  variant="outline"
                >
                  Look Up Another Order
                </Button>
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return Home
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SecureOrderLookup;