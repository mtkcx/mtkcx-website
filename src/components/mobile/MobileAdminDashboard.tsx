import React, { useState, useEffect } from 'react';
import ContactMessagesManager from '@/components/ContactMessagesManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  Eye,
  Crown,
  UserCheck,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminCustomerSearch } from '@/components/AdminCustomerSearch';
import { MobileNotificationManager } from './MobileNotificationManager';
import { NotificationCenter } from './NotificationCenter';

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

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email to search');
      return;
    }

    setLoading(true);
    try {
      // Mock user data (in real implementation, you'd need a way to get auth.users data)
      const mockUsers = [
        { id: '1', email: searchEmail, created_at: new Date().toISOString() }
      ];

      // Get user roles for found users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Add roles to users
      const usersWithRoles = mockUsers.map(user => ({
        ...user,
        role: roles.find(role => role.user_id === user.id)?.role || 'user'
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('promote_user_to_admin', {
        target_user_id: userId
      });

      if (error) throw error;

      toast.success('User promoted to admin successfully');
      searchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user to admin');
    }
  };

  const demoteAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('demote_admin_to_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast.success('Admin demoted to user successfully');
      searchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error demoting admin:', error);
      toast.error('Failed to demote admin');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4" />
          User Role Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="text-sm"
            />
            <Button onClick={searchUsers} disabled={loading} size="sm">
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {users.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Search Results:</h4>
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Role: <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {user.role === 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => demoteAdmin(user.id)}
                        className="text-xs"
                      >
                        Demote
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => promoteToAdmin(user.id)}
                        className="text-xs"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Promote
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const MobileAdminDashboard: React.FC = () => {
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
        .limit(10);

      if (ordersError) throw ordersError;

      // Fetch quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (quotesError) throw quotesError;

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (enrollmentsError) throw enrollmentsError;

      setOrders(ordersData || []);
      setQuotes(quotesData || []);
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch dashboard data');
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
      <div className="container mx-auto p-4">
        <div className="text-center">Loading admin dashboard...</div>
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
    <div className="container mx-auto p-4 space-y-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-primary">Mobile Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage orders, quotes, enrollments, and users</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Orders</CardTitle>
            <Package className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Pending Quotes</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.pendingQuotes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Pending Enrollments</CardTitle>
            <BookOpen className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.pendingEnrollments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="customers" className="space-y-3">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="customers" className="text-[10px] px-1">Customers</TabsTrigger>
          <TabsTrigger value="orders" className="text-[10px] px-1">Orders</TabsTrigger>
          <TabsTrigger value="quotes" className="text-[10px] px-1">Quotes</TabsTrigger>
          <TabsTrigger value="enrollments" className="text-[10px] px-1">Enrollments</TabsTrigger>
        </TabsList>
        
        {/* Secondary tabs row */}
        <TabsList className="grid w-full grid-cols-3 gap-1 mt-2">
          <TabsTrigger value="messages" className="text-[10px] px-1">Messages</TabsTrigger>
          <TabsTrigger value="notifications" className="text-[10px] px-1">SMS System</TabsTrigger>
          <TabsTrigger value="users" className="text-[10px] px-1">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-3">
          <AdminCustomerSearch isMobile={true} />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">No orders found.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.email}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{formatCurrency(order.amount)}</div>
                        <Badge className={`${getStatusColor(order.status)} text-xs`}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">No quotes found.</p>
              ) : (
                <div className="space-y-3">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Quote #{quote.id.slice(0, 8)}</div>
                        <div className="text-xs text-muted-foreground">{quote.service_type}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(quote.created_at)}</div>
                      </div>
                      <div>
                        <Badge className={`${getStatusColor(quote.status)} text-xs`}>{quote.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="enrollments" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">No enrollments found.</p>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{enrollment.name}</div>
                        <div className="text-xs text-muted-foreground">{enrollment.email}</div>
                        <div className="text-xs text-muted-foreground">{enrollment.phone}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(enrollment.created_at)}</div>
                      </div>
                      <div>
                        <Badge className={`${getStatusColor(enrollment.status)} text-xs`}>{enrollment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-3">
          <ContactMessagesManager isMobile={true} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SMS System</CardTitle>
              </CardHeader>
              <CardContent>
                <MobileNotificationManager />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter isOpen={true} onClose={() => {}} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <UserRoleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};