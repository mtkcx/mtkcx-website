import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  Truck,
  BookOpen,
  ShoppingCart,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface Enrollment {
  id: string;
  course_type: string;
  status: string;
  created_at: string;
  scheduled_date?: string;
}

export const MobileDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { getTotalItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            unit_price
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;
      
      // Mock enrollments data for now
      const enrollmentsData = [];

      // No error handling needed for simplified query

      setOrders(ordersData?.map(order => ({
        ...order,
        total_amount: order.amount,
        items: (order.order_items || []).map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price
        }))
      })) || []);
      
      setEnrollments([]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">
              {profile?.full_name || user?.email || 'User'}
            </p>
          </div>
          <div className="relative">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div className="text-lg font-bold">{getTotalItems()}</div>
              <div className="text-xs text-muted-foreground">Cart Items</div>
            </div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-bold">{orders.length}</div>
              <div className="text-xs text-muted-foreground">Orders</div>
            </div>
          </Card>
          
          <Card className="p-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-lg font-bold">{enrollments.length}</div>
              <div className="text-xs text-muted-foreground">Courses</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          {orders.length === 0 ? (
            <Card className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button className="mt-3">Start Shopping</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Card key={order.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{order.order_number}</span>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </Badge>
                      </div>
                      <span className="font-semibold">${order.total_amount}</span>
                    </div>
                    
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {item.quantity}x {item.product_name}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Ordered {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Course Enrollments</h2>
            <Button variant="outline" size="sm">Browse Courses</Button>
          </div>
          
          {enrollments.length === 0 ? (
            <Card className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No course enrollments</p>
              <Button className="mt-3">Explore Courses</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.map(enrollment => (
                <Card key={enrollment.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {enrollment.course_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    
                    {enrollment.scheduled_date && (
                      <div className="text-sm text-muted-foreground">
                        Scheduled: {new Date(enrollment.scheduled_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Enrolled {new Date(enrollment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">
                  {profile?.full_name || 'Complete your profile'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user?.email}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <div className="font-medium">
                    {profile?.phone || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Company</label>
                  <div className="font-medium">
                    {profile?.company || 'Not set'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <div className="font-medium">
                  {profile?.address ? `${profile.address}, ${profile.city || ''}` : 'Not set'}
                </div>
              </div>
            </div>
            
            <Button className="w-full">Update Profile</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};