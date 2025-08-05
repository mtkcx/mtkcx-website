import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Calendar, 
  User, 
  Mail,
  Phone,
  Building,
  Edit,
  Save,
  X
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Quote {
  id: string;
  user_id: string;
  service_type: string;
  message: string | null;
  status: string;
  estimated_price: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    company: string | null;
    user_id: string;
  } | null;
}

const QuoteAdmin = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    status: '',
    estimated_price: '',
    admin_notes: ''
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      // First get all quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quotesError) {
        console.error('Error fetching quotes:', quotesError);
        toast({
          title: 'Error',
          description: 'Failed to load quotes',
          variant: 'destructive',
        });
        return;
      }

      // Then get all profiles for the user_ids in quotes
      const userIds = quotesData?.map(q => q.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine the data
      const quotesWithProfiles = quotesData?.map(quote => ({
        ...quote,
        profiles: profilesData?.find(profile => profile.user_id === quote.user_id) || null
      })) || [];

      setQuotes(quotesWithProfiles);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote.id);
    setEditData({
      status: quote.status,
      estimated_price: quote.estimated_price?.toString() || '',
      admin_notes: quote.admin_notes || ''
    });
  };

  const handleSaveQuote = async (quoteId: string) => {
    try {
      const updateData: any = {
        status: editData.status,
        admin_notes: editData.admin_notes
      };

      if (editData.estimated_price) {
        updateData.estimated_price = parseFloat(editData.estimated_price);
      }

      const { error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quoteId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update quote',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Quote updated successfully',
      });

      setEditingQuote(null);
      fetchQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading quotes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Quote Management
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage customer quote requests and update their status.
            </p>
          </div>

          {/* Quotes List */}
          <div className="space-y-6">
            {quotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Quote Requests</h3>
                  <p className="text-muted-foreground">
                    No customer quote requests have been submitted yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              quotes.map((quote) => (
                <Card key={quote.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          {quote.service_type}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(quote.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                        {editingQuote !== quote.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuote(quote)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-2 text-muted-foreground" />
                          {quote.profiles?.full_name || 'No name provided'}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
                          {quote.profiles?.phone || 'No phone provided'}
                        </div>
                        <div className="flex items-center">
                          <Building className="w-3 h-3 mr-2 text-muted-foreground" />
                          {quote.profiles?.company || 'No company provided'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quote Message */}
                    {quote.message && (
                      <div>
                        <h4 className="font-semibold mb-2">Customer Message:</h4>
                        <p className="text-sm bg-background p-3 rounded">{quote.message}</p>
                      </div>
                    )}
                    
                    {/* Edit Form or Display */}
                    {editingQuote === quote.id ? (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="price">Estimated Price (₪)</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="Enter price in ILS"
                              value={editData.estimated_price}
                              onChange={(e) => setEditData({...editData, estimated_price: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="notes">Admin Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add notes for the customer..."
                            value={editData.admin_notes}
                            onChange={(e) => setEditData({...editData, admin_notes: e.target.value})}
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button onClick={() => handleSaveQuote(quote.id)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingQuote(null)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        {quote.estimated_price && (
                          <p className="text-sm">
                            <strong>Estimated Price:</strong> ₪{quote.estimated_price.toLocaleString()}
                          </p>
                        )}
                        {quote.admin_notes && (
                          <p className="text-sm mt-2">
                            <strong>Admin Notes:</strong> {quote.admin_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuoteAdmin;