import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  amount: number;
  status: string;
  created_at: string;
  customer_phone?: string;
}

interface Quote {
  id: string;
  user_id: string;
  service_type: string;
  message: string;
  status: string;
  estimated_price?: number;
  created_at: string;
  profiles?: {
    full_name: string;
    phone?: string;
  };
}

interface Enrollment {
  id: string;
  name: string;
  email: string;
  phone: string;
  course_type: string;
  status: string;
  created_at: string;
}

export const MobileDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        .limit(10);

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch quotes (simplified without profiles join)
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (quotesError) throw quotesError;
      setQuotes(quotesData?.map(quote => ({ ...quote, profiles: null })) || []);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center">
          <div className="animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const stats = {
    totalOrders: orders.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    pendingEnrollments: enrollments.filter(e => e.status === 'pending').length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.amount), 0)
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Mobile Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage orders, quotes, and enrollments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Quotes</p>
              <p className="text-xl font-bold">{stats.pendingQuotes}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Enrollments</p>
              <p className="text-xl font-bold">{stats.pendingEnrollments}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          {orders.length === 0 ? (
            <Card className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">
                        {formatCurrency(Number(order.amount))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{order.email}</span>
                    </div>
                    
                    {order.customer_phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Quotes</h3>
          {quotes.length === 0 ? (
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No quotes found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <Card key={quote.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{quote.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{quote.service_type}</p>
                      </div>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{quote.message}</p>
                    
                    {quote.estimated_price && (
                      <div className="text-sm font-semibold text-primary">
                        Estimated: {formatCurrency(Number(quote.estimated_price))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(quote.created_at)}</span>
                    </div>
                    
                    {quote.profiles?.phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{quote.profiles.phone}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <h3 className="text-lg font-semibold">Course Enrollments</h3>
          {enrollments.length === 0 ? (
            <Card className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No enrollments found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{enrollment.name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.course_type}</p>
                      </div>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{enrollment.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{enrollment.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(enrollment.created_at)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};