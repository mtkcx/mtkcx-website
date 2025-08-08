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
  subject: string;
  content: string;
  template_type: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  variables: any;
  created_at: string;
  updated_at: string;
}

const EmailAdmin = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
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
    valid_until: ''
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'promotional',
    description: '',
    variables: '{}'
  });

  useEffect(() => {
    fetchCampaigns();
    fetchEmailLogs();
    fetchEmailTemplates();
    createSampleCampaigns();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching email templates:', error);
        return;
      }

      setEmailTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

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
        .in('name', ['Welcome Campaign', 'New Product Launch', 'Newsletter Campaign']);

      if (existingCampaigns && existingCampaigns.length > 0) {
        return; // Sample campaigns already exist
      }

      const sampleCampaigns = [
        {
          name: 'Welcome Campaign',
          subject: '🎉 Welcome to Our Community!',
          content: `
            <h2>Welcome to our store, {customer_name}!</h2>
            <p>We're excited to have you join our community of satisfied customers.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>What's Next?</h3>
              <p>Browse our products and find exactly what you need for your business.</p>
            </div>
            
            <p>Best regards,<br>The Team</p>
          `,
          campaign_type: 'welcome',
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
              <h3>Check Out Our Latest Additions</h3>
              <p>Be among the first to experience these innovative solutions.</p>
            </div>
            
            <p>Happy shopping!<br>The Team</p>
          `,
          campaign_type: 'product_announcement',
          valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        },
        {
          name: 'Newsletter Campaign',
          subject: '📢 Monthly Newsletter - What\'s New',
          content: `
            <h2>Hi {customer_name},</h2>
            <p>Here's what's happening this month in our store!</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Monthly Updates</h3>
              <p>Stay informed about our latest news, products, and company updates.</p>
            </div>
            
            <p>Thank you for being part of our community!<br>The Team</p>
          `,
          campaign_type: 'newsletter',
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
    content = content.replace(/\{valid_until\}/g, campaign.valid_until ? new Date(campaign.valid_until).toLocaleDateString() : 'December 31, 2024');
    
    return content;
  };

  const getSystemTemplatePreview = (template: EmailTemplate) => {
    // Replace placeholders in actual template content
    let content = template.content;
    
    // Replace variables with sample data
    if (template.variables) {
      const variables = typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables;
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`;
        let sampleValue = '';
        
        switch (key) {
          case 'name':
          case 'customer_name':
            sampleValue = 'John Doe';
            break;
          case 'shop_url':
            sampleValue = window.location.origin;
            break;
          case 'order_number':
            sampleValue = 'ORD-12345';
            break;
          case 'total_amount':
            sampleValue = '₪150.00';
            break;
          case 'payment_method':
            sampleValue = 'Credit Card';
            break;
          case 'campaign_name':
            sampleValue = 'Special Promotion';
            break;
          case 'campaign_content':
            sampleValue = '<p>We have exciting news to share with you!</p>';
            break;
          default:
            sampleValue = variables[key] || `[${key}]`;
        }
        
        content = content.replace(new RegExp(placeholder, 'g'), sampleValue);
      });
    }
    
    return content;
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

      switch (template.template_type) {
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

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        name: templateFormData.name,
        subject: templateFormData.subject,
        content: templateFormData.content,
        template_type: templateFormData.template_type,
        description: templateFormData.description,
        variables: templateFormData.variables,
        is_system: false,
        is_active: true
      };

      const { error } = await supabase
        .from('email_templates')
        .insert([templateData]);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create template',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Template created successfully',
      });

      setShowCreateTemplateDialog(false);
      setTemplateFormData({
        name: '',
        subject: '',
        content: '',
        template_type: 'promotional',
        description: '',
        variables: '{}'
      });
      fetchEmailTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleEditTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const templateData = {
        name: templateFormData.name,
        subject: templateFormData.subject,
        content: templateFormData.content,
        template_type: templateFormData.template_type,
        description: templateFormData.description,
        variables: templateFormData.variables
      };

      const { error } = await supabase
        .from('email_templates')
        .update(templateData)
        .eq('id', selectedTemplate.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update template',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });

      setShowEditTemplateDialog(false);
      setSelectedTemplate(null);
      fetchEmailTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete template',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });

      fetchEmailTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
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
            <div className="flex space-x-2">
              <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Email Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="Custom Welcome Email"
                          value={templateFormData.name}
                          onChange={(e) => setTemplateFormData({...templateFormData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-type">Template Type</Label>
                        <Select value={templateFormData.template_type} onValueChange={(value) => setTemplateFormData({...templateFormData, template_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="promotional">Promotional</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="welcome">Welcome</SelectItem>
                            <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                            <SelectItem value="tracking">Shipping Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="template-subject">Email Subject</Label>
                      <Input
                        id="template-subject"
                        placeholder="Welcome to our community!"
                        value={templateFormData.subject}
                        onChange={(e) => setTemplateFormData({...templateFormData, subject: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="template-description">Description</Label>
                      <Input
                        id="template-description"
                        placeholder="Describe when this template should be used"
                        value={templateFormData.description}
                        onChange={(e) => setTemplateFormData({...templateFormData, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="template-variables">Variables (JSON format)</Label>
                      <Textarea
                        id="template-variables"
                        placeholder='{"customer_name": "Customer Name", "shop_url": "Shop URL"}'
                        value={templateFormData.variables}
                        onChange={(e) => setTemplateFormData({...templateFormData, variables: e.target.value})}
                        rows={3}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Define variables as JSON. Use {"{variable_name}"} in content to reference them.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="template-content">Template Content (HTML)</Label>
                      <Textarea
                        id="template-content"
                        placeholder="<h1>Welcome {{customer_name}}!</h1><p>Thank you for joining us.</p>"
                        value={templateFormData.content}
                        onChange={(e) => setTemplateFormData({...templateFormData, content: e.target.value})}
                        rows={12}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use {"{{variable_name}}"} for dynamic content. HTML is supported.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

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
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="content">Email Content</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Campaign Name</Label>
                        <Input
                          id="name"
                          placeholder="Monthly Newsletter"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        placeholder="📢 Monthly Newsletter - What's New"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Email Content (HTML supported)</Label>
                      <Textarea
                        id="content"
                        placeholder="Use placeholders: {customer_name}, {valid_until}"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Available placeholders: {"{customer_name}"}, {"{valid_until}"}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="valid_until">Valid Until (Optional)</Label>
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
          </div>
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
                        <Badge variant={template.is_system ? 'secondary' : 'default'}>
                          {template.is_system ? 'System' : 'Custom'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Type: <strong>{template.template_type.replace('_', ' ')}</strong>
                      </p>
                      {template.is_system && (
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
                                <p><strong>Type:</strong> {template.template_type.replace('_', ' ')}</p>
                                <p><strong>Status:</strong> {template.is_system ? 'System Template' : 'Custom Template'}</p>
                              </div>
                              <div 
                                className="prose prose-sm max-w-none p-4 bg-white border rounded"
                                dangerouslySetInnerHTML={{ __html: getSystemTemplatePreview(template) }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>

                        {!template.is_system && (
                          <>
                            <Dialog open={showEditTemplateDialog && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                              setShowEditTemplateDialog(open);
                              if (!open) {
                                setSelectedTemplate(null);
                              } else {
                                setSelectedTemplate(template);
                                setTemplateFormData({
                                  name: template.name,
                                  subject: template.subject,
                                  content: template.content,
                                  template_type: template.template_type,
                                  description: template.description || '',
                                  variables: typeof template.variables === 'string' ? template.variables : JSON.stringify(template.variables, null, 2)
                                });
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedTemplate(template)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Template: {template.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="edit-template-name">Template Name</Label>
                                      <Input
                                        id="edit-template-name"
                                        value={templateFormData.name}
                                        onChange={(e) => setTemplateFormData({...templateFormData, name: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-template-type">Template Type</Label>
                                      <Select value={templateFormData.template_type} onValueChange={(value) => setTemplateFormData({...templateFormData, template_type: value})}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="promotional">Promotional</SelectItem>
                                          <SelectItem value="newsletter">Newsletter</SelectItem>
                                          <SelectItem value="welcome">Welcome</SelectItem>
                                          <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                                          <SelectItem value="tracking">Shipping Notification</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-template-subject">Email Subject</Label>
                                    <Input
                                      id="edit-template-subject"
                                      value={templateFormData.subject}
                                      onChange={(e) => setTemplateFormData({...templateFormData, subject: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-template-description">Description</Label>
                                    <Input
                                      id="edit-template-description"
                                      value={templateFormData.description}
                                      onChange={(e) => setTemplateFormData({...templateFormData, description: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-template-variables">Variables (JSON format)</Label>
                                    <Textarea
                                      id="edit-template-variables"
                                      value={templateFormData.variables}
                                      onChange={(e) => setTemplateFormData({...templateFormData, variables: e.target.value})}
                                      rows={3}
                                      className="font-mono text-sm"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="edit-template-content">Template Content (HTML)</Label>
                                    <Textarea
                                      id="edit-template-content"
                                      value={templateFormData.content}
                                      onChange={(e) => setTemplateFormData({...templateFormData, content: e.target.value})}
                                      rows={12}
                                      className="font-mono text-sm"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 mt-6">
                                  <Button variant="outline" onClick={() => setShowEditTemplateDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleEditTemplate}>
                                    Update Template
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
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
                    {/* Campaign Info */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Campaign Information
                      </h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Type:</strong> {campaign.campaign_type.replace('_', ' ')}</p>
                        <p><strong>Created:</strong> {formatDate(campaign.created_at)}</p>
                        {campaign.valid_until && (
                          <p><strong>Valid Until:</strong> {formatDate(campaign.valid_until)}</p>
                        )}
                      </div>
                    </div>
                    
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