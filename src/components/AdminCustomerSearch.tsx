import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CustomerSearchProps {
  isMobile?: boolean;
}

interface Customer {
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_gateway: string;
  order_type: string;
  order_items: Array<{
    product_name: string;
    variant_size: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface CustomerStats {
  total_orders: number;
  total_spent: number;
  currency: string;
  first_order_date?: string;
  last_order_date?: string;
  most_purchased_product?: {
    product_name: string;
    variant_size: string;
    total_quantity: number;
  };
}

export const AdminCustomerSearch: React.FC<CustomerSearchProps> = ({ isMobile = false }) => {
  const [searchType, setSearchType] = useState<'email' | 'name' | 'phone' | 'order_number'>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      let customerData: Customer | null = null;
      let ordersData: CustomerOrder[] = [];

      if (searchType === 'order_number') {
        // Search by order number first
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              product_name,
              variant_size,
              quantity,
              unit_price,
              total_price
            )
          `)
          .eq('order_number', searchQuery.trim())
          .single();

        if (orderError && orderError.code !== 'PGRST116') {
          throw orderError;
        }

        if (orderData) {
          ordersData = [orderData];
          
          if (orderData.user_id) {
            // Get customer profile if user_id exists
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', orderData.user_id)
              .single();

            if (!profileError && profileData) {
              customerData = {
                user_id: profileData.user_id,
                email: orderData.email,
                full_name: profileData.full_name,
                phone: profileData.phone,
                company: profileData.company,
                address: profileData.address,
                city: profileData.city,
                country: profileData.country,
                created_at: profileData.created_at
              };
            } else {
              // Guest order - create customer object from order data
              customerData = {
                user_id: '',
                email: orderData.email,
                full_name: orderData.customer_name,
                phone: orderData.customer_phone,
                created_at: orderData.created_at
              };
            }
          }
        }
      } else {
        // Search in profiles table
        let query = supabase.from('profiles').select('*');
        
        switch (searchType) {
          case 'email':
            // We need to join with auth.users to search by email, but since we can't access auth.users directly,
            // we'll search in orders table first to find the user_id
            const { data: ordersByEmail, error: emailError } = await supabase
              .from('orders')
              .select('user_id, email')
              .eq('email', searchQuery.trim())
              .limit(1);

            if (emailError) throw emailError;

            if (ordersByEmail && ordersByEmail.length > 0 && ordersByEmail[0].user_id) {
              query = query.eq('user_id', ordersByEmail[0].user_id);
            } else {
              // No registered user found, show message
              toast.error('No registered customer found with this email. Try searching by order number for guest orders.');
              return;
            }
            break;
          case 'name':
            query = query.ilike('full_name', `%${searchQuery.trim()}%`);
            break;
          case 'phone':
            query = query.eq('phone', searchQuery.trim());
            break;
        }

        const { data: profileData, error: profileError } = await query.single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          // Get email from orders table
          const { data: userOrders, error: emailError } = await supabase
            .from('orders')
            .select('email')
            .eq('user_id', profileData.user_id)
            .limit(1);

          customerData = {
            ...profileData,
            email: userOrders?.[0]?.email || 'Unknown'
          };
        }
      }

      if (!customerData) {
        toast.error('No customer found with the provided search criteria');
        setCustomer(null);
        setOrders([]);
        setStats(null);
        return;
      }

      // If we found a customer with user_id, get all their orders
      if (customerData.user_id) {
        const { data: allOrdersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              product_name,
              variant_size,
              quantity,
              unit_price,
              total_price
            )
          `)
          .eq('user_id', customerData.user_id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        ordersData = allOrdersData || [];
      }

      // Calculate customer statistics
      const totalSpent = ordersData.reduce((sum, order) => sum + Number(order.amount), 0);
      const currency = ordersData[0]?.currency || 'ILS';
      const sortedOrders = ordersData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      // Calculate most purchased product
      const productMap = new Map<string, { quantity: number; product_name: string; variant_size: string }>();
      ordersData.forEach(order => {
        order.order_items?.forEach(item => {
          const key = `${item.product_name}-${item.variant_size}`;
          const existing = productMap.get(key);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            productMap.set(key, {
              quantity: item.quantity,
              product_name: item.product_name,
              variant_size: item.variant_size
            });
          }
        });
      });

      const mostPurchased = Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)[0];

      const customerStats: CustomerStats = {
        total_orders: ordersData.length,
        total_spent: totalSpent,
        currency,
        first_order_date: sortedOrders[0]?.created_at,
        last_order_date: sortedOrders[sortedOrders.length - 1]?.created_at,
        most_purchased_product: mostPurchased ? {
          product_name: mostPurchased.product_name,
          variant_size: mostPurchased.variant_size,
          total_quantity: mostPurchased.quantity
        } : undefined
      };

      setCustomer(customerData);
      setOrders(ordersData);
      setStats(customerStats);
      toast.success('Customer found successfully');

    } catch (error) {
      console.error('Error searching for customer:', error);
      toast.error('Failed to search for customer');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatCurrency = (amount: number, currency: string = 'ILS') => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  return (
    <Card className={isMobile ? '' : 'shadow-lg'}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
          <Search className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          Customer Search & Purchase History
        </CardTitle>
        <CardDescription className={isMobile ? 'text-xs' : ''}>
          Search for customers by email, name, phone, or order number to view their purchase history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Controls */}
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
          <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
            <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[140px]'} ${isMobile ? 'text-xs' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="order_number">Order Number</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder={`Enter ${searchType.replace('_', ' ')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isMobile ? 'text-sm' : ''}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            size={isMobile ? 'sm' : 'default'}
            className={isMobile ? 'text-xs' : ''}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Customer Information */}
        {customer && (
          <div className="space-y-4">
            <Separator />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Customer Details */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                    <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  
                  {customer.full_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.full_name}</span>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  
                  {customer.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.company}</span>
                    </div>
                  )}
                  
                  {(customer.city || customer.address) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[customer.address, customer.city, customer.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {format(new Date(customer.created_at), 'MMM yyyy')}</span>
                  </div>
                  
                  <div className="pt-2">
                    <Badge variant={customer.user_id ? 'default' : 'secondary'}>
                      {customer.user_id ? 'Registered Customer' : 'Guest Customer'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Statistics */}
              {stats && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                      <TrendingUp className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      Purchase Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid grid-cols-2 ${isMobile ? 'gap-3' : 'lg:grid-cols-4 gap-4'}`}>
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>
                          {stats.total_orders}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                          Total Orders
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>
                          {formatCurrency(stats.total_spent, stats.currency)}
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                          Total Spent
                        </div>
                      </div>
                      
                      {stats.total_orders > 0 && (
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>
                            {formatCurrency(stats.total_spent / stats.total_orders, stats.currency)}
                          </div>
                          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                            Average Order
                          </div>
                        </div>
                      )}
                      
                      {stats.most_purchased_product && (
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-orange-600`}>
                            {stats.most_purchased_product.total_quantity}x
                          </div>
                          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                            {stats.most_purchased_product.product_name} ({stats.most_purchased_product.variant_size})
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                  <ShoppingBag className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  Order History ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className={`text-muted-foreground text-center py-4 ${isMobile ? 'text-xs' : ''}`}>
                    No orders found for this customer.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
                              #{order.order_number}
                            </span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size={isMobile ? 'sm' : 'default'}
                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                            className={isMobile ? 'text-xs' : ''}
                          >
                            <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                            {selectedOrder?.id === order.id ? 'Hide' : 'View'} Details
                          </Button>
                        </div>
                        
                        <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {order.order_items?.length || 0} item(s)
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                            {order.payment_gateway} • {order.order_type}
                          </span>
                          <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
                            {formatCurrency(Number(order.amount), order.currency)}
                          </span>
                        </div>

                        {/* Order Details */}
                        {selectedOrder?.id === order.id && order.order_items && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <h4 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Order Items:</h4>
                            {order.order_items.map((item, index) => (
                              <div key={index} className={`flex items-center justify-between p-2 bg-muted/30 rounded ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-muted-foreground">
                                    Size: {item.variant_size} • Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    {formatCurrency(Number(item.total_price), order.currency)}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {formatCurrency(Number(item.unit_price), order.currency)} each
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};