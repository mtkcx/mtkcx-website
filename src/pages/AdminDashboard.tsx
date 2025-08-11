import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Package, Users, GraduationCap, TrendingUp } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  status: string;
  amount: number;
  customer_name: string;
  email: string;
}

interface Quote {
  id: string;
  created_at: string;
  status: string;
  service_type: string;
  user_id: string;
}

interface Enrollment {
  id: string;
  created_at: string;
  status: string;
  name: string;
  email: string;
  phone: string;
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) throw ordersError;

      // Fetch quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (quotesError) throw quotesError;

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (enrollmentsError) throw enrollmentsError;

      setOrders(ordersData || []);
      setQuotes(quotesData || []);
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₪${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading dashboard...</div>
        </div>
        <Footer />
      </div>
    );
  }

    // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    pendingEnrollments: enrollments.filter(e => e.status === 'pending').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage orders, quotes, and enrollments</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEnrollments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.email}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(order.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.amount)}</div>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quotes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No quotes found.</p>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Quote #{quote.id.slice(0, 8)}</div>
                          <div className="text-sm text-muted-foreground">{quote.service_type}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(quote.created_at)}</div>
                        </div>
                        <div>
                          <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="enrollments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No enrollments found.</p>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{enrollment.name}</div>
                          <div className="text-sm text-muted-foreground">{enrollment.email}</div>
                          <div className="text-sm text-muted-foreground">{enrollment.phone}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(enrollment.created_at)}</div>
                        </div>
                        <div>
                          <Badge className={getStatusColor(enrollment.status)}>{enrollment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

const ProtectedAdminDashboard = () => (
  <AdminProtectedRoute>
    <AdminDashboard />
  </AdminProtectedRoute>
);

export default ProtectedAdminDashboard;