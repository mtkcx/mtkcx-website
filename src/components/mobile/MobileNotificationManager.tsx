import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  Plus, 
  Edit, 
  Send, 
  Trash2, 
  Users,
  MessageCircle,
  Check,
  X,
  Globe,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  title: string;
  title_ar?: string;
  title_he?: string;
  message: string;
  message_ar?: string;
  message_he?: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

interface SentNotification {
  id: string;
  title: string;
  message: string;
  language: string;
  status: string;
  sent_at?: string;
  user_id?: string;
  device_id?: string;
  order_id?: string;
}

export const MobileNotificationManager: React.FC = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    title_he: '',
    message: '',
    message_ar: '',
    message_he: '',
    notification_type: 'general'
  });

  useEffect(() => {
    fetchNotifications();
    fetchSentNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  const fetchSentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('sent_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSentNotifications(data || []);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      toast.error('Failed to fetch sent notifications');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      title_he: '',
      message: '',
      message_ar: '',
      message_he: '',
      notification_type: 'order_confirmed'
    });
    setEditingNotification(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.title.trim() || !formData.message.trim()) {
        toast.error('Title and message are required');
        return;
      }

      const { error } = await supabase
        .from('customer_notifications')
        .insert({
          title: formData.title,
          title_ar: formData.title_ar || null,
          title_he: formData.title_he || null,
          message: formData.message,
          message_ar: formData.message_ar || null,
          message_he: formData.message_he || null,
          notification_type: formData.notification_type,
          is_active: true
        });

      if (error) throw error;

      toast.success('SMS template created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error creating SMS template:', error);
      toast.error('Failed to create SMS template');
    }
  };

  const handleUpdate = async () => {
    if (!editingNotification) return;

    try {
      if (!formData.title.trim() || !formData.message.trim()) {
        toast.error('Title and message are required');
        return;
      }

      const { error } = await supabase
        .from('customer_notifications')
        .update({
          title: formData.title,
          title_ar: formData.title_ar || null,
          title_he: formData.title_he || null,
          message: formData.message,
          message_ar: formData.message_ar || null,
          message_he: formData.message_he || null,
          notification_type: formData.notification_type
        })
        .eq('id', editingNotification.id);

      if (error) throw error;

      toast.success('Notification updated successfully');
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleToggleActive = async (notification: Notification) => {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ is_active: !notification.is_active })
        .eq('id', notification.id);

      if (error) throw error;

      toast.success(`Notification ${!notification.is_active ? 'activated' : 'deactivated'}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast.error('Failed to update notification status');
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await supabase
        .from('customer_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      title_ar: notification.title_ar || '',
      title_he: notification.title_he || '',
      message: notification.message,
      message_ar: notification.message_ar || '',
      message_he: notification.message_he || '',
      notification_type: notification.notification_type
    });
  };

  const sendTestNotification = async (notification: Notification) => {
    try {
      // Insert a test notification into sent_notifications
      const { error } = await supabase
        .from('sent_notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          language: 'en',
          status: 'sent',
          notification_id: notification.id,
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Test notification sent successfully');
      fetchSentNotifications();
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'order_confirmed':
      case 'payment_received':
        return 'default';
      case 'order_shipped':
      case 'order_delivered':
        return 'secondary';
      case 'appointment_reminder':
      case 'promotion':
        return 'warning';
      case 'welcome':
        return 'outline';
      case 'order_cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'default';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
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

  const NotificationForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notification_type">SMS Message Type</Label>
        <Select 
          value={formData.notification_type} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, notification_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
            <SelectItem value="order_shipped">Order Shipped</SelectItem>
            <SelectItem value="order_delivered">Order Delivered</SelectItem>
            <SelectItem value="payment_received">Payment Received</SelectItem>
            <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
            <SelectItem value="promotion">Promotion/Offer</SelectItem>
            <SelectItem value="welcome">Welcome Message</SelectItem>
            <SelectItem value="order_cancelled">Order Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Templates */}
      <div className="space-y-2">
        <Label>Quick Templates</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormData(prev => ({
              ...prev,
              title: 'Order Confirmed',
              title_ar: 'تم تأكيد الطلب',
              title_he: 'הזמנה אושרה',
              message: 'Your order #{ORDER_NUMBER} has been confirmed. Total: ₪{AMOUNT}. We will prepare it shortly.',
              message_ar: 'تم تأكيد طلبك رقم #{ORDER_NUMBER}. المجموع: ₪{AMOUNT}. سنقوم بتحضيره قريباً.',
              message_he: 'הזמנתך מס\' #{ORDER_NUMBER} אושרה. סה"כ: ₪{AMOUNT}. נכין אותה בקרוב.',
              notification_type: 'order_confirmed'
            }))}
            className="text-xs"
          >
            Order Confirmed
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormData(prev => ({
              ...prev,
              title: 'Order Shipped',
              title_ar: 'تم شحن الطلب',
              title_he: 'הזמנה נשלחה',
              message: 'Great news! Your order #{ORDER_NUMBER} is on its way. Track: {TRACKING_NUMBER}',
              message_ar: 'أخبار رائعة! طلبك رقم #{ORDER_NUMBER} في الطريق. تتبع: {TRACKING_NUMBER}',
              message_he: 'חדשות טובות! הזמנתך מס\' #{ORDER_NUMBER} בדרך. מעקב: {TRACKING_NUMBER}',
              notification_type: 'order_shipped'
            }))}
            className="text-xs"
          >
            Order Shipped
          </Button>
        </div>
      </div>

      {/* English Fields */}
      <div className="space-y-2">
        <Label htmlFor="title">SMS Title (English) *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter SMS title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">SMS Message (English) *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Enter SMS message (use {ORDER_NUMBER}, {AMOUNT}, {TRACKING_NUMBER} for dynamic values)"
          rows={3}
        />
        <div className="text-xs text-muted-foreground">
          Available variables: {'{ORDER_NUMBER}'}, {'{AMOUNT}'}, {'{TRACKING_NUMBER}'}, {'{CUSTOMER_NAME}'}
        </div>
      </div>

      {/* Arabic Fields */}
      <div className="space-y-2">
        <Label htmlFor="title_ar">SMS Title (Arabic)</Label>
        <Input
          id="title_ar"
          value={formData.title_ar}
          onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
          placeholder="أدخل عنوان الرسالة"
          dir="rtl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message_ar">SMS Message (Arabic)</Label>
        <Textarea
          id="message_ar"
          value={formData.message_ar}
          onChange={(e) => setFormData(prev => ({ ...prev, message_ar: e.target.value }))}
          placeholder="أدخل نص الرسالة"
          rows={3}
          dir="rtl"
        />
      </div>

      {/* Hebrew Fields */}
      <div className="space-y-2">
        <Label htmlFor="title_he">SMS Title (Hebrew)</Label>
        <Input
          id="title_he"
          value={formData.title_he}
          onChange={(e) => setFormData(prev => ({ ...prev, title_he: e.target.value }))}
          placeholder="הכנס כותרת הודעה"
          dir="rtl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message_he">SMS Message (Hebrew)</Label>
        <Textarea
          id="message_he"
          value={formData.message_he}
          onChange={(e) => setFormData(prev => ({ ...prev, message_he: e.target.value }))}
          placeholder="הכנס טקסט הודעה"
          rows={3}
          dir="rtl"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={editingNotification ? handleUpdate : handleCreate}
          className="flex-1"
        >
          {editingNotification ? 'Update' : 'Create'} SMS Template
        </Button>
        <Button 
          variant="outline" 
          onClick={resetForm}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Customer SMS Manager
          </h2>
          <p className="text-sm text-muted-foreground">Create and manage SMS templates for customers</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New SMS Template</DialogTitle>
            </DialogHeader>
            <NotificationForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="text-xs">
            <MessageCircle className="h-4 w-4 mr-1" />
            SMS Templates
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs">
            <Send className="h-4 w-4 mr-1" />
            SMS History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-3">
          {editingNotification && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editing SMS Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationForm />
              </CardContent>
            </Card>
          )}

          {notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No SMS templates found.</p>
                <p className="text-sm text-muted-foreground">Create your first SMS template above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{notification.title}</h3>
                            <Badge variant={getNotificationTypeColor(notification.notification_type)} className="text-xs">
                              {notification.notification_type}
                            </Badge>
                            <Badge 
                              variant={notification.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {notification.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Created: {formatDate(notification.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Translation Preview */}
                      {(notification.title_ar || notification.title_he) && (
                        <div className="space-y-1 text-xs">
                          {notification.title_ar && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              <span className="text-muted-foreground">AR:</span>
                              <span dir="rtl">{notification.title_ar}</span>
                            </div>
                          )}
                          {notification.title_he && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3" />
                              <span className="text-muted-foreground">HE:</span>
                              <span dir="rtl">{notification.title_he}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(notification)}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendTestNotification(notification)}
                          className="text-xs"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(notification)}
                          className="text-xs"
                        >
                          {notification.is_active ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-3">
          {sentNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No SMS messages sent yet.</p>
                <p className="text-sm text-muted-foreground">Sent SMS messages will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sentNotifications.map((sent) => (
                <Card key={sent.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{sent.title}</h3>
                          <Badge variant={getStatusColor(sent.status)} className="text-xs">
                            {sent.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {sent.language.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {sent.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          {sent.sent_at && (
                            <span>Sent: {formatDate(sent.sent_at)}</span>
                          )}
                          {sent.user_id && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              User
                            </span>
                          )}
                          {sent.device_id && (
                            <span className="flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              Device
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};