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
  Trash2,
  History,
  FileText,
  Users,
  CheckCircle,
  Clock
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

interface EmailLog {
  id: string;
  email: string;
  email_type: string;
  subject: string;
  status: string;
  sent_at: string;
  order_id?: string;
  campaign_id?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'system';
}

const EmailAdmin = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showTemplatePreviewDialog, setShowTemplatePreviewDialog] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    campaign_type: 'promotional',
    discount_code: '',
    discount_percentage: '',
    valid_until: ''
  });

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      type: 'welcome',
      description: 'Sent automatically when users subscribe to newsletter',
      status: 'system'
    },
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      type: 'order_confirmation',
      description: 'Sent automatically when orders are placed',
      status: 'system'
    },
    {
      id: 'tracking',
      name: 'Shipping Notification',
      type: 'tracking',
      description: 'Sent when order tracking information is available',
      status: 'system'
    },
    {
      id: 'promotional',
      name: 'Promotional Campaign',
      type: 'promotional',
      description: 'Custom marketing campaigns with discount codes',
      status: 'active'
    }
  ];

  useEffect(() => {
    fetchCampaigns();
    fetchEmailLogs();
    createSampleCampaigns();
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

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching email logs:', error);
        return;
      }

      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const createSampleCampaigns = async () => {
    try {
      // Check if sample campaigns already exist
      const { data: existingCampaigns } = await supabase
        .from('email_campaigns')
        .select('name')
        .in('name', ['Welcome Offer Campaign', 'New Product Launch', 'Seasonal Sale']);

      if (existingCampaigns && existingCampaigns.length > 0) {
        return; // Sample campaigns already exist
      }

      const sampleCampaigns = [
        {
          name: 'Welcome Offer Campaign',
          subject: '🎉 Welcome! Get 20% Off Your First Order',
          content: `
            <h2>Welcome to our store, {customer_name}!</h2>
            <p>We're excited to have you join our community of satisfied customers.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Special Welcome Offer!</h3>
              <p>Use code <strong>{discount_code}</strong> for {discount_percentage}% off your first order</p>
              <p>Valid until: {valid_until}</p>
            </div>
            
            <p>Browse our products and find exactly what you need for your business.</p>
            
            <p>Best regards,<br>The Team</p>
          `,
          campaign_type: 'promotional',
          discount_code: 'WELCOME20',
          discount_percentage: 20,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        },
        {
          name: 'New Product Launch',
          subject: '🚀 New Products Just Arrived!',
          content: `
            <h2>Hello {customer_name},</h2>
            <p>We're excited to announce the arrival of our latest products!</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Limited Time Launch Offer</h3>
              <p>Get {discount_percentage}% off all new products with code <strong>{discount_code}</strong></p>
              <p>Offer expires: {valid_until}</p>
            </div>
            
            <p>Check out our latest additions and be among the first to experience these innovative solutions.</p>
            
            <p>Happy shopping!<br>The Team</p>
          `,
          campaign_type: 'product_announcement',
          discount_code: 'NEWLAUNCH15',
          discount_percentage: 15,
          valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        },
        {
          name: 'Seasonal Sale',
          subject: '🔥 Limited Time: Up to 30% Off Everything!',
          content: `
            <h2>Hi {customer_name},</h2>
            <p>Our biggest sale of the season is here!</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Seasonal Mega Sale!</h3>
              <p>Save {discount_percentage}% on your entire order with code <strong>{discount_code}</strong></p>
              <p>Sale ends: {valid_until}</p>
            </div>
            
            <p>Don't miss out on these incredible savings. Shop now before the sale ends!</p>
            
            <p>Happy savings!<br>The Team</p>
          `,
          campaign_type: 'seasonal',
          discount_code: 'SEASON30',
          discount_percentage: 30,
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        }
      ];

      await supabase
        .from('email_campaigns')
        .insert(sampleCampaigns);

      console.log('Sample campaigns created successfully');
    } catch (error) {
      console.error('Error creating sample campaigns:', error);
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

  const getSystemTemplatePreview = (template: EmailTemplate) => {
    // Mock template content based on the edge functions
    switch (template.type) {
      case 'welcome':
        return `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome John Doe!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for joining our community</p>
            </div>
            <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
              <h2 style="color: #333; margin-top: 0;">What to Expect</h2>
              <div style="margin: 30px 0;">
                <h3 style="color: #667eea; margin-bottom: 10px;">🚀 Exclusive Offers</h3>
                <p>Be the first to know about special discounts, promotions, and exclusive deals available only to our subscribers.</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <h3 style="color: #333; margin-top: 0;">Special Welcome Offer!</h3>
                <p style="margin: 15px 0;">Use code <strong style="background: #667eea; color: white; padding: 5px 10px; border-radius: 4px;">WELCOME10</strong> for 10% off your first order</p>
              </div>
            </div>
          </div>
        `;
      case 'order_confirmation':
        return `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✅</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your order John Doe</p>
            </div>
            <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
                <p><strong>Order Number:</strong> ORD-12345</p>
                <p><strong>Total Amount:</strong> ₪150.00</p>
                <p><strong>Payment Method:</strong> Credit Card</p>
              </div>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0ea5e9; margin-top: 0;">What's Next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>We'll prepare your order and send you tracking information</li>
                  <li>Expected delivery: 3-5 business days</li>
                </ul>
              </div>
            </div>
          </div>
        `;
      case 'tracking':
        return `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Package Shipped! 📦</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your order is on its way to you</p>
            </div>
            <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #333; margin-bottom: 15px;">Hi John Doe!</h2>
                <p>Great news! Your order has been shipped and is on its way to you.</p>
              </div>
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">Tracking Information</h3>
                <p style="margin: 5px 0;"><strong>Tracking Number:</strong> 1Z999AA1234567890</p>
                <p style="margin: 5px 0;"><strong>Expected Delivery:</strong> 3-5 business days</p>
              </div>
            </div>
          </div>
        `;
      default:
        return '<p>Template preview not available</p>';
    }
  };

  const handleTestSystemTemplate = async (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      let functionName = '';
      let requestBody: any = {};

      switch (template.type) {
        case 'welcome':
          functionName = 'send-welcome-email';
          requestBody = { email: testEmail, name: 'Test User' };
          break;
        case 'order_confirmation':
          // For testing, we'll create a mock order scenario
          toast({
            title: 'Info',
            description: 'Order confirmation emails require an actual order. Use the test campaigns instead.',
            variant: 'default',
          });
          return;
        case 'tracking':
          // For testing, we'll create a mock tracking scenario
          toast({
            title: 'Info',
            description: 'Tracking emails require an actual order. Use the test campaigns instead.',
            variant: 'default',
          });
          return;
        default:
          toast({
            title: 'Error',
            description: 'Template type not supported for testing',
            variant: 'destructive',
          });
          return;
      }

      const { error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send test email',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Test email sent successfully',
      });

      setShowTestEmailDialog(false);
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      });
    }
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
                Email Management Center
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Manage all email templates, campaigns, and view email logs in one unified interface.
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

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Email Templates
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Email Logs
              </TabsTrigger>
            </TabsList>

            {/* Email Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                           <CardTitle className="flex items-center">
                             <FileText className="w-5 h-5 mr-2" />
                             {template.name}
                           </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                        <Badge variant={template.status === 'system' ? 'secondary' : 'default'}>
                          {template.status === 'system' ? 'Automatic' : 'Custom'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Type: <strong>{template.type.replace('_', ' ')}</strong>
                      </p>
                      {template.status === 'system' && (
                        <div className="bg-muted/30 p-3 rounded-lg mb-4">
                          <p className="text-xs text-muted-foreground">
                            This template is sent automatically by the system when specific events occur.
                          </p>
                        </div>
                      )}

                      {/* Template Actions */}
                      <div className="flex space-x-2">
                        <Dialog open={showTemplatePreviewDialog && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                          setShowTemplatePreviewDialog(open);
                          if (!open) setSelectedTemplate(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Template Preview: {template.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="border-b pb-4">
                                <p><strong>Template:</strong> {template.name}</p>
                                <p><strong>Type:</strong> {template.type.replace('_', ' ')}</p>
                                <p><strong>Status:</strong> {template.status === 'system' ? 'Automatic System Template' : 'Custom Template'}</p>
                              </div>
                              <div 
                                className="prose prose-sm max-w-none p-4 bg-white border rounded"
                                dangerouslySetInnerHTML={{ __html: getSystemTemplatePreview(template) }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>

                        {template.status === 'system' && template.type === 'welcome' && (
                          <Dialog open={showTestEmailDialog && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                            setShowTestEmailDialog(open);
                            if (!open) {
                              setSelectedTemplate(null);
                              setTestEmail('');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTemplate(template)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Test Email
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Test Email: {template.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="test-email">Email Address</Label>
                                  <Input
                                    id="test-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    A test email will be sent to this address
                                  </p>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setShowTestEmailDialog(false);
                                      setTestEmail('');
                                      setSelectedTemplate(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={() => handleTestSystemTemplate(template)}>
                                    Send Test Email
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
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
            </TabsContent>

            {/* Email Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Email Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emailLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Email Activity</h3>
                      <p className="text-muted-foreground">
                        Email logs will appear here when emails are sent to customers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emailLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">
                                {log.email_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm font-medium">{log.subject}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {log.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(log.sent_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={log.status === 'sent' ? 'default' : 'destructive'}
                              className="flex items-center gap-1"
                            >
                              {log.status === 'sent' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {log.status}
                            </Badge>
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
      </div>

      <Footer />
    </div>
  );
};

export default EmailAdmin;