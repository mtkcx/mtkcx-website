import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Plus, 
  Eye, 
  Send, 
  Tag, 
  Calendar,
  Percent,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  campaign_type: string;
  status: string;
  discount_code: string | null;
  discount_percentage: number | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

const EmailAdmin = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    campaign_type: 'promotional',
    discount_code: '',
    discount_percentage: '',
    valid_until: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load campaigns',
          variant: 'destructive',
        });
        return;
      }

      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const campaignData: any = {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        campaign_type: formData.campaign_type,
        status: 'draft'
      };

      if (formData.discount_code) {
        campaignData.discount_code = formData.discount_code;
      }
      if (formData.discount_percentage) {
        campaignData.discount_percentage = parseInt(formData.discount_percentage);
      }
      if (formData.valid_until) {
        campaignData.valid_until = formData.valid_until;
      }

      const { error } = await supabase
        .from('email_campaigns')
        .insert([campaignData]);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create campaign',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });

      setShowCreateDialog(false);
      setFormData({
        name: '',
        subject: '',
        content: '',
        campaign_type: 'promotional',
        discount_code: '',
        discount_percentage: '',
        valid_until: ''
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-promotional-email', {
        body: { campaignId }
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send campaign',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Campaign sent successfully',
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete campaign',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied',
      description: 'Discount code copied to clipboard',
    });
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmailTemplatePreview = (campaign: EmailCampaign) => {
    let content = campaign.content;
    
    // Replace placeholders with sample data
    content = content.replace(/\{customer_name\}/g, 'John Doe');
    content = content.replace(/\{discount_code\}/g, campaign.discount_code || 'SAVE20');
    content = content.replace(/\{discount_percentage\}/g, campaign.discount_percentage?.toString() || '20');
    content = content.replace(/\{valid_until\}/g, campaign.valid_until ? new Date(campaign.valid_until).toLocaleDateString() : 'December 31, 2024');
    
    return content;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
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
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-4">
                Email Campaign Manager
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Create, preview, and send email campaigns with discount codes to your customers.
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Email Campaign</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Email Content</TabsTrigger>
                    <TabsTrigger value="discount">Discount Code</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input
                        id="name"
                        placeholder="Summer Sale 2024"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        placeholder="🔥 Summer Sale - Up to 50% Off!"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="campaign_type">Campaign Type</Label>
                      <Select value={formData.campaign_type} onValueChange={(value) => setFormData({...formData, campaign_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="product_announcement">Product Announcement</SelectItem>
                          <SelectItem value="seasonal">Seasonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Email Content (HTML supported)</Label>
                      <Textarea
                        id="content"
                        placeholder="Use placeholders: {customer_name}, {discount_code}, {discount_percentage}, {valid_until}"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Available placeholders: {"{customer_name}"}, {"{discount_code}"}, {"{discount_percentage}"}, {"{valid_until}"}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="discount" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="discount_code">Discount Code</Label>
                      <Input
                        id="discount_code"
                        placeholder="SAVE20"
                        value={formData.discount_code}
                        onChange={(e) => setFormData({...formData, discount_code: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discount_percentage">Discount Percentage</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        placeholder="20"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="valid_until">Valid Until</Label>
                      <Input
                        id="valid_until"
                        type="datetime-local"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign}>
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaigns List */}
          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Email Campaigns</h3>
                  <p className="text-muted-foreground">
                    Create your first email campaign to start engaging with customers.
                  </p>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Mail className="w-5 h-5 mr-2" />
                          {campaign.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {campaign.subject}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created: {formatDate(campaign.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.campaign_type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Discount Info */}
                    {campaign.discount_code && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Discount Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Code: <strong>{campaign.discount_code}</strong></span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyDiscountCode(campaign.discount_code!)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center">
                            <Percent className="w-3 h-3 mr-2 text-muted-foreground" />
                            {campaign.discount_percentage}% OFF
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-2 text-muted-foreground" />
                            Valid until: {campaign.valid_until ? formatDate(campaign.valid_until) : 'No expiry'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Dialog open={showPreviewDialog && selectedCampaign?.id === campaign.id} onOpenChange={(open) => {
                        setShowPreviewDialog(open);
                        if (!open) setSelectedCampaign(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Email Preview: {campaign.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="border-b pb-4">
                              <p><strong>Subject:</strong> {campaign.subject}</p>
                              <p><strong>Type:</strong> {campaign.campaign_type}</p>
                            </div>
                            <div 
                              className="prose prose-sm max-w-none p-4 bg-white border rounded"
                              dangerouslySetInnerHTML={{ __html: getEmailTemplatePreview(campaign) }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {campaign.status === 'draft' && (
                        <Button onClick={() => handleSendCampaign(campaign.id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Campaign
                        </Button>
                      )}
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

export default EmailAdmin;