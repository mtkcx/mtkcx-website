import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Eye,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_gateway: string;
  order_type: string;
  order_items: Array<{
    id: string;
    product_name: string;
    variant_size: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface ProductStats {
  product_name: string;
  variant_size: string;
  total_quantity: number;
  total_spent: number;
}

interface DashboardStats {
  total_orders: number;
  total_spent: number;
  currency: string;
}

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total_orders: 0, total_spent: 0, currency: 'ILS' });
  const [topProducts, setTopProducts] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch recent orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          amount,
          currency,
          status,
          created_at,
          payment_gateway,
          order_type,
          order_items (
            id,
            product_name,
            variant_size,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // Fetch all orders for statistics
      const { data: allOrdersData, error: statsError } = await supabase
        .from('orders')
        .select('amount, currency')
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      // Fetch product statistics
      const { data: productStatsData, error: productError } = await supabase
        .from('order_items')
        .select(`
          product_name,
          variant_size,
          quantity,
          total_price,
          order_id
        `)
        .in('order_id', ordersData?.map(o => o.id) || []);

      if (productError) throw productError;

      setOrders(ordersData || []);

      // Calculate statistics
      const totalSpent = allOrdersData?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
      const currency = allOrdersData?.[0]?.currency || 'ILS';
      
      setStats({
        total_orders: allOrdersData?.length || 0,
        total_spent: totalSpent,
        currency
      });

      // Calculate top products
      const productMap = new Map<string, ProductStats>();
      
      productStatsData?.forEach(item => {
        const key = `${item.product_name}-${item.variant_size}`;
        const existing = productMap.get(key);
        
        if (existing) {
          existing.total_quantity += item.quantity;
          existing.total_spent += Number(item.total_price);
        } else {
          productMap.set(key, {
            product_name: item.product_name,
            variant_size: item.variant_size,
            total_quantity: item.quantity,
            total_spent: Number(item.total_price)
          });
        }
      });

      const topProductsList = Array.from(productMap.values())
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 5);

      setTopProducts(topProductsList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
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

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_orders}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime orders placed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_spent.toFixed(2)} {stats.currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime purchase amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_orders > 0 
                ? (stats.total_spent / stats.total_orders).toFixed(2) 
                : '0.00'} {stats.currency}
            </div>
            <p className="text-xs text-muted-foreground">
              Average order value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Your latest order history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
                <p className="text-sm">Start shopping to see your orders here!</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{order.order_number}</span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {order.payment_gateway}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {order.order_items?.length || 0} item(s)
                    </span>
                    <span className="font-semibold">
                      {Number(order.amount).toFixed(2)} {order.currency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Purchased Products
            </CardTitle>
            <CardDescription>Your favorite products by quantity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No purchase history</p>
                <p className="text-sm">Your top products will appear here after purchases</p>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={`${product.product_name}-${product.variant_size}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {product.variant_size}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.total_quantity}x</p>
                    <p className="text-sm text-muted-foreground">
                      {product.total_spent.toFixed(2)} {stats.currency}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal/Dialog would go here */}
      {selectedOrder && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Order #{selectedOrder.order_number}</CardTitle>
              <CardDescription>
                Placed on {format(new Date(selectedOrder.created_at), 'MMMM dd, yyyy')}
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
              ×
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Badge>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-3">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.variant_size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {Number(item.total_price).toFixed(2)} {selectedOrder.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Number(item.unit_price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{Number(selectedOrder.amount).toFixed(2)} {selectedOrder.currency}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};