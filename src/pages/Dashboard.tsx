import React, { useState, useEffect } from 'react';
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
  Settings
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserQuotes();
    }
  }, [user]);

  const fetchUserQuotes = async () => {
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
            <Badge className="mb-4 px-4 py-2">
              {t('dashboard.customer_portal')}
            </Badge>
            <h1 className="text-4xl font-bold text-primary mb-4">
              {t('dashboard.welcome')}, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('dashboard.welcome_description')}
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

          {/* Quick Actions */}
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
                    onClick={() => navigate('/gallery')}
                  >
                    <FileText className="w-8 h-8" />
                    <span>{t('dashboard.new_quote')}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex-col space-y-2"
                    onClick={() => navigate('/products')}
                  >
                    <Building className="w-8 h-8" />
                    <span>{t('dashboard.browse_products')}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex-col space-y-2"
                    onClick={() => navigate('/admin/products')}
                  >
                    <Settings className="w-8 h-8" />
                    <span>Product Admin</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex-col space-y-2"
                    onClick={() => navigate('/contact')}
                  >
                    <Mail className="w-8 h-8" />
                    <span>{t('dashboard.contact_us')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;