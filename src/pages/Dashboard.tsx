import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Edit3,
  Settings,
  Package,
  MessageCircle,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface Quote {
  id: string;
  service_type: string;
  message: string | null;
  status: string;
  estimated_price: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  created_at: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  admin_notes?: string;
}

const Dashboard = () => {
  const { user, profile, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const fetchUserQuotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        toast({
          title: t('dashboard.error'),
          description: t('dashboard.quotes_fetch_error'),
          variant: 'destructive',
        });
        return;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setQuotesLoading(false);
    }
  }, [user?.id, toast, t]);

  const fetchEnrollments = useCallback(async () => {
    try {
      setEnrollmentsLoading(true);
      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enrollment requests',
        variant: 'destructive',
      });
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserQuotes();
      if (isAdmin) {
        fetchEnrollments();
      }
    }
  }, [user, isAdmin, fetchUserQuotes, fetchEnrollments]);

  // Set up real-time subscription for enrollments
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('enrollment-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'enrollment_requests'
        },
        (payload) => {
          // Real-time enrollment update detected
          
          if (payload.eventType === 'INSERT') {
            // Add new enrollment to the beginning of the list
            setEnrollments(prev => [payload.new as Enrollment, ...prev.slice(0, 9)]);
            toast({
              title: 'New Enrollment Request',
              description: `${payload.new.name} has submitted an enrollment request`,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Update existing enrollment
            setEnrollments(prev => 
              prev.map(enrollment => 
                enrollment.id === payload.new.id ? payload.new as Enrollment : enrollment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted enrollment
            setEnrollments(prev => 
              prev.filter(enrollment => enrollment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);

  const updateEnrollmentStatus = async (id: string, status: string) => {
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

      toast({
        title: 'Success',
        description: `Enrollment status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const saveEnrollmentNotes = async (id: string) => {
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

      toast({
        title: 'Success',
        description: 'Admin notes updated successfully',
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickActionClick = (path: string, tabName?: string) => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (tabName) {
      setActiveTab(tabName);
    }
    navigate(path);
  };

  const handleBackToOverview = () => {
    // Scroll to top when going back to overview
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab(null);
  };

  const handleEnrollmentAdminClick = () => {
    // Scroll to top when opening enrollment admin
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('enrollments');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('dashboard.status_pending');
      case 'approved':
        return t('dashboard.status_approved');
      case 'rejected':
        return t('dashboard.status_rejected');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {activeTab && (
              <div className="flex items-center justify-center mb-4">
                <Button variant="outline" onClick={handleBackToOverview} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard Overview
                </Button>
              </div>
            )}
            <Badge className="mb-4 px-4 py-2">
              {isAdmin ? 'Admin Dashboard' : t('dashboard.customer_portal')}
            </Badge>
            <h1 className="text-4xl font-bold text-primary mb-4">
              {t('dashboard.welcome')}, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isAdmin ? 'Manage your business and view customer activity' : t('dashboard.welcome_description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {t('dashboard.profile_info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  
                  {profile?.full_name && (
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profile.full_name}</span>
                    </div>
                  )}
                  
                  {profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  
                  {profile?.company && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profile.company}</span>
                    </div>
                  )}
                  
                  {profile?.city && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profile.city}, {profile.country}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/profile')}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {t('dashboard.edit_profile')}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quote Requests */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    {t('dashboard.quote_requests')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quotesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">{t('dashboard.loading_quotes')}</p>
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('dashboard.no_quotes')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {t('dashboard.no_quotes_desc')}
                      </p>
                      <Button onClick={() => navigate('/gallery')}>
                        {t('dashboard.request_quote')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <Card key={quote.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{quote.service_type}</h4>
                                <p className="text-sm text-muted-foreground flex items-center mt-1">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(quote.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(quote.status)}
                                <Badge variant={quote.status === 'approved' ? 'default' : 'secondary'}>
                                  {getStatusText(quote.status)}
                                </Badge>
                              </div>
                            </div>
                            
                            {quote.message && (
                              <p className="text-sm mb-3">{quote.message}</p>
                            )}
                            
                            {quote.estimated_price && (
                              <div className="bg-primary/5 p-3 rounded-lg mb-3">
                                <p className="text-sm font-medium">
                                  {t('dashboard.estimated_price')}: ₪{quote.estimated_price.toLocaleString()}
                                </p>
                              </div>
                            )}
                            
                            {quote.admin_notes && (
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm font-medium mb-1">{t('dashboard.admin_notes')}:</p>
                                <p className="text-sm">{quote.admin_notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Customer Dashboard - Order History & Stats */}
          {!activeTab && (
            <div className="mt-8">
              <CustomerDashboard />
            </div>
          )}

          {/* Admin Enrollment Management */}
          {isAdmin && activeTab === 'enrollments' && (
            <div className="mt-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Course Enrollment Management
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {enrollments.length} Total
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading enrollments...</p>
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Enrollment Requests</h3>
                      <p className="text-muted-foreground">
                        New enrollment requests will appear here automatically
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Latest enrollment requests (updates in real-time)
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchEnrollments}
                          disabled={enrollmentsLoading}
                        >
                          Refresh
                        </Button>
                      </div>
                      
                      {enrollments.map((enrollment) => (
                        <Card key={enrollment.id} className="border">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {enrollment.name}
                              </CardTitle>
                              <div className="flex gap-2">
                                <Badge className={getStatusColor(enrollment.status)}>
                                  {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                </Badge>
                                <Badge variant="outline">
                                  Professional Detailing
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {format(new Date(enrollment.created_at), 'MMM dd, HH:mm')}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{enrollment.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{enrollment.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(enrollment.created_at), 'MMM dd, yyyy HH:mm')}
                                </span>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex gap-2 mb-3 flex-wrap">
                                <Button
                                  size="sm"
                                  variant={enrollment.status === 'pending' ? 'default' : 'outline'}
                                  onClick={() => updateEnrollmentStatus(enrollment.id, 'pending')}
                                >
                                  Pending
                                </Button>
                                <Button
                                  size="sm"
                                  variant={enrollment.status === 'contacted' ? 'default' : 'outline'}
                                  onClick={() => updateEnrollmentStatus(enrollment.id, 'contacted')}
                                >
                                  Contacted
                                </Button>
                                <Button
                                  size="sm"
                                  variant={enrollment.status === 'enrolled' ? 'default' : 'outline'}
                                  onClick={() => updateEnrollmentStatus(enrollment.id, 'enrolled')}
                                >
                                  Enrolled
                                </Button>
                                <Button
                                  size="sm"
                                  variant={enrollment.status === 'declined' ? 'default' : 'outline'}
                                  onClick={() => updateEnrollmentStatus(enrollment.id, 'declined')}
                                >
                                  Declined
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">Admin Notes:</label>
                                  {editingNotes === enrollment.id ? (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => saveEnrollmentNotes(enrollment.id)}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingNotes(null);
                                          setNotesValue('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingNotes(enrollment.id);
                                        setNotesValue(enrollment.admin_notes || '');
                                      }}
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      Edit Notes
                                    </Button>
                                  )}
                                </div>
                                
                                {editingNotes === enrollment.id ? (
                                  <Textarea
                                    value={notesValue}
                                    onChange={(e) => setNotesValue(e.target.value)}
                                    placeholder="Add admin notes..."
                                    rows={3}
                                  />
                                ) : (
                                  <div className="bg-muted p-3 rounded-md min-h-[60px]">
                                    <p className="text-sm text-muted-foreground">
                                      {enrollment.admin_notes || 'No notes added yet'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          {!activeTab && (
            <div className="mt-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex-col space-y-2"
                      onClick={() => handleQuickActionClick('/gallery', 'quotes')}
                    >
                      <FileText className="w-8 h-8" />
                      <span>{t('dashboard.new_quote')}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex-col space-y-2"
                      onClick={() => handleQuickActionClick('/products', 'products')}
                    >
                      <Building className="w-8 h-8" />
                      <span>{t('dashboard.browse_products')}</span>
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          className="h-auto p-6 flex-col space-y-2"
                          onClick={handleEnrollmentAdminClick}
                        >
                          <GraduationCap className="w-8 h-8" />
                          <span>Enrollment Admin</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-auto p-6 flex-col space-y-2"
                          onClick={() => handleQuickActionClick('/admin/orders', 'orders')}
                        >
                          <Package className="w-8 h-8" />
                          <span>Orders Admin</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-auto p-6 flex-col space-y-2"
                          onClick={() => handleQuickActionClick('/admin/products', 'products')}
                        >
                          <Settings className="w-8 h-8" />
                          <span>Product Admin</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="h-auto p-6 flex-col space-y-2"
                          onClick={() => handleQuickActionClick('/admin/chat', 'chat')}
                        >
                          <MessageCircle className="w-8 h-8" />
                          <span>Chat Admin</span>
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex-col space-y-2"
                      onClick={() => handleQuickActionClick('/contact', 'contact')}
                    >
                      <Mail className="w-8 h-8" />
                      <span>{t('dashboard.contact_us')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;