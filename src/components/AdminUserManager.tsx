import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, ShieldCheck, Crown, Mail, Calendar, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
  full_name: string | null;
}

interface RegularUser {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  is_admin: boolean;
}

export const AdminUserManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [demoting, setDemoting] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminUsers();
      searchUsers();
    }
  }, [isAdmin]);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_users');
      
      if (error) {
        console.error('Error fetching admin users:', error);
        toast.error('Failed to fetch admin users');
        return;
      }

      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Failed to fetch admin users');
    }
  };

  const searchUsers = async (email?: string) => {
    setLoading(true);
    try {
      // Fetch user profiles with their role information
      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          created_at,
          user_roles(role)
        `);

      if (email) {
        // We need to join with auth.users to search by email, but we can't do that directly
        // So we'll search by name instead for now
        query = query.ilike('full_name', `%${email}%`);
      }

      const { data: profiles, error } = await query.limit(20);

      if (error) {
        console.error('Error searching users:', error);
        return;
      }

      // Transform the data to include admin status
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        email: 'Protected', // Email is protected in profiles table
        created_at: profile.created_at,
        full_name: profile.full_name,
        is_admin: (profile as any).user_roles?.role === 'admin'
      })) || [];

      setRegularUsers(usersWithRoles.filter(user => !user.is_admin));
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    setPromoting(userId);
    try {
      const { data, error } = await supabase.rpc('promote_user_to_admin_secure', {
        target_user_id: userId
      });

      if (error) {
        throw error;
      }

      toast.success('User promoted to admin successfully');
      fetchAdminUsers();
      searchUsers();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast.error(error.message || 'Failed to promote user to admin');
    } finally {
      setPromoting(null);
    }
  };

  const demoteAdmin = async (userId: string) => {
    setDemoting(userId);
    try {
      const { data, error } = await supabase.rpc('demote_admin_to_user_secure', {
        target_user_id: userId
      });

      if (error) {
        throw error;
      }

      toast.success('Admin demoted to regular user successfully');
      fetchAdminUsers();
      searchUsers();
    } catch (error: any) {
      console.error('Error demoting admin:', error);
      toast.error(error.message || 'Failed to demote admin');
    } finally {
      setDemoting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <Alert className="border-destructive/50 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage user roles. Only administrators can access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Access Control:</strong> Only users with admin privileges can access administrative features. 
              Regular users can only use the website for orders and basic functionality.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="admins" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admins">Current Admins</TabsTrigger>
              <TabsTrigger value="promote">Promote Users</TabsTrigger>
            </TabsList>

            <TabsContent value="admins" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Administrator Users</h3>
                <Button onClick={fetchAdminUsers} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              {adminUsers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No admin users found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {adminUsers.map((admin) => (
                    <Card key={admin.user_id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{admin.full_name || 'Unknown'}</p>
                                <Badge variant="default" className="text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {admin.email}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Admin since: {formatDate(admin.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => demoteAdmin(admin.user_id)}
                            disabled={demoting === admin.user_id}
                            className="text-destructive hover:text-destructive border-destructive/20"
                          >
                            {demoting === admin.user_id ? (
                              'Demoting...'
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove Admin
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="promote" className="space-y-4">
              <div>
                <Label htmlFor="search">Search Users to Promote</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers(searchEmail)}
                  />
                  <Button 
                    onClick={() => searchUsers(searchEmail)}
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {regularUsers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No regular users found</p>
                      <p className="text-sm">Search for users by name to promote them to admin</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {regularUsers.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-muted p-2 rounded-full">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.full_name || 'Unknown'}</p>
                                <Badge variant="secondary" className="text-xs">
                                  Customer
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined: {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => promoteToAdmin(user.id)}
                            disabled={promoting === user.id}
                            size="sm"
                          >
                            {promoting === user.id ? (
                              'Promoting...'
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Make Admin
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};