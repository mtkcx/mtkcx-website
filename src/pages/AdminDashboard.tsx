import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Package, Users, GraduationCap, TrendingUp, Crown, UserCheck, Mail, Phone, Calendar, MapPin, Trash2, Edit3, Check, X } from 'lucide-react';
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
  city?: string;
  course_type: string;
  admin_notes?: string;
  updated_at: string;
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

const EnrollmentQuickActions: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Show only latest 10 for quick actions

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollment requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, name: string) => {
    try {
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === id ? { ...enrollment, status } : enrollment
        )
      );

      toast.success(`${name}'s enrollment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteEnrollment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the enrollment request from ${name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollment_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEnrollments(prev => prev.filter(enrollment => enrollment.id !== id));
      toast.success(`Enrollment request from ${name} has been deleted`);
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Failed to delete enrollment request');
    }
  };

  const saveNotes = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ admin_notes: notesValue })
        .eq('id', id);

      if (error) throw error;

      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === id ? { ...enrollment, admin_notes: notesValue } : enrollment
        )
      );

      setEditingNotes(null);
      setNotesValue('');
      toast.success(`Notes updated for ${name}`);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enrolled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Enrollment Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading enrollment requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Enrollment Quick Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest enrollment requests with quick status updates
        </p>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No enrollment requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="border rounded-lg p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-lg">{enrollment.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {enrollment.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {enrollment.phone}
                      </span>
                      {enrollment.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {enrollment.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEnrollment(enrollment.id, enrollment.name)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Course: <span className="font-medium text-foreground">
                      {enrollment.course_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {formatDate(enrollment.created_at)}
                  </span>
                </div>

                {/* Quick Status Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={enrollment.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => updateStatus(enrollment.id, 'pending', enrollment.name)}
                    className="text-xs"
                  >
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={enrollment.status === 'contacted' ? 'default' : 'outline'}
                    onClick={() => updateStatus(enrollment.id, 'contacted', enrollment.name)}
                    className="text-xs"
                  >
                    Contacted
                  </Button>
                  <Button
                    size="sm"
                    variant={enrollment.status === 'enrolled' ? 'default' : 'outline'}
                    onClick={() => updateStatus(enrollment.id, 'enrolled', enrollment.name)}
                    className="text-xs"
                  >
                    Enrolled
                  </Button>
                  <Button
                    size="sm"
                    variant={enrollment.status === 'declined' ? 'default' : 'outline'}
                    onClick={() => updateStatus(enrollment.id, 'declined', enrollment.name)}
                    className="text-xs"
                  >
                    Declined
                  </Button>
                </div>

                {/* Notes Section */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Admin Notes:</span>
                    {editingNotes === enrollment.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => saveNotes(enrollment.id, enrollment.name)}
                          className="h-7 px-2"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNotes(null);
                            setNotesValue('');
                          }}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingNotes(enrollment.id);
                          setNotesValue(enrollment.admin_notes || '');
                        }}
                        className="h-7 px-2"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {editingNotes === enrollment.id ? (
                    <Textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Add admin notes..."
                      className="text-sm"
                      rows={2}
                    />
                  ) : (
                    <div className="bg-muted/50 p-2 rounded text-sm min-h-[40px] flex items-center">
                      <span className="text-muted-foreground">
                        {enrollment.admin_notes || 'No notes added yet'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {enrollments.length > 5 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('/admin/enrollments', '_blank')}
                  className="w-full"
                >
                  View All {enrollments.length} Enrollment Requests
                </Button>
              </div>
            )}
          </div>
        )}
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

        {/* Quick Actions Section - Only for Admins */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnrollmentQuickActions />
            {/* You can add more quick action components here */}
          </div>
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