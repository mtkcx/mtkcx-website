import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Package, Users, GraduationCap, TrendingUp, Crown, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AdminCustomerSearch } from '@/components/AdminCustomerSearch';
import ContactMessagesManager from '@/components/ContactMessagesManager';
import { AdminUserManager } from '@/components/AdminUserManager';
import SEOManager from '@/components/SEOManager';
import SiteSettingsManager from '@/components/SiteSettingsManager';

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
      // Search in profiles table by email from auth.users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(10);

      if (profilesError) throw profilesError;

      // Get user roles for found users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Mock user data (in real implementation, you'd need a way to get auth.users data)
      const mockUsers = [
        { id: '1', email: searchEmail, created_at: new Date().toISOString() }
      ];

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
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          User Role Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user email to search"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <Button onClick={searchUsers} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {users.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results:</h4>
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Role: <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.role === 'admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => demoteAdmin(user.id)}
                      >
                        Demote to User
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => promoteToAdmin(user.id)}
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Promote to Admin
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
          <p className="text-muted-foreground">Manage orders, quotes, enrollments, and user roles</p>
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
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Customer Search</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="messages">Contact Messages</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="site">Site Settings</TabsTrigger>
            <TabsTrigger value="seo">Advanced SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="space-y-4">
            <AdminCustomerSearch />
          </TabsContent>
          
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

          <TabsContent value="messages" className="space-y-4">
            <ContactMessagesManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManager />
          </TabsContent>

          <TabsContent value="site" className="space-y-4">
            <SiteSettingsManager />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <SEOManager />
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