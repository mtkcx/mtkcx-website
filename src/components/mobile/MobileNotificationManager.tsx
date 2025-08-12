import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Send, Bell, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  title_ar?: string;
  message_ar?: string;
  title_he?: string;
  message_he?: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
}

export const MobileNotificationManager: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    title_ar: '',
    message_ar: '',
    title_he: '',
    message_he: '',
    notification_type: 'general',
    is_active: true
  });

  useEffect(() => {
    fetchNotifications();
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
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotification = async () => {
    try {
      if (!formData.title || !formData.message) {
        toast({
          title: 'Validation Error',
          description: 'Title and message are required',
          variant: 'destructive'
        });
        return;
      }

      if (editingNotification) {
        const { error } = await supabase
          .from('customer_notifications')
          .update(formData)
          .eq('id', editingNotification.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Notification updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('customer_notifications')
          .insert(formData);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Notification created successfully'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Notification deleted successfully'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      title_ar: notification.title_ar || '',
      message_ar: notification.message_ar || '',
      title_he: notification.title_he || '',
      message_he: notification.message_he || '',
      notification_type: notification.notification_type,
      is_active: notification.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      title_ar: '',
      message_ar: '',
      title_he: '',
      message_he: '',
      notification_type: 'general',
      is_active: true
    });
    setEditingNotification(null);
  };

  const getNotificationTypeLabel = (type: string) => {
    const types = {
      general: 'General',
      order_reminder: 'Order Reminder',
      delivery_update: 'Delivery Update',
      promotion: 'Promotion',
      maintenance: 'Maintenance'
    };
    return types[type as keyof typeof types] || type;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Customer Notifications
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? 'Edit Notification' : 'Create New Notification'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
                <TabsTrigger value="he">עברית</TabsTrigger>
              </TabsList>
              
              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title..."
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message (English)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message..."
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="ar" className="space-y-4">
                <div>
                  <Label htmlFor="title_ar">Title (Arabic)</Label>
                  <Input
                    id="title_ar"
                    value={formData.title_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                    placeholder="عنوان الإشعار..."
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="message_ar">Message (Arabic)</Label>
                  <Textarea
                    id="message_ar"
                    value={formData.message_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, message_ar: e.target.value }))}
                    placeholder="رسالة الإشعار..."
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="he" className="space-y-4">
                <div>
                  <Label htmlFor="title_he">Title (Hebrew)</Label>
                  <Input
                    id="title_he"
                    value={formData.title_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_he: e.target.value }))}
                    placeholder="כותרת ההודעה..."
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="message_he">Message (Hebrew)</Label>
                  <Textarea
                    id="message_he"
                    value={formData.message_he}
                    onChange={(e) => setFormData(prev => ({ ...prev, message_he: e.target.value }))}
                    placeholder="תוכן ההודעה..."
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notification_type">Notification Type</Label>
                <Select 
                  value={formData.notification_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, notification_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="order_reminder">Order Reminder</SelectItem>
                    <SelectItem value="delivery_update">Delivery Update</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveNotification} className="flex-1">
                {editingNotification ? 'Update' : 'Create'} Notification
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{notification.title}</h3>
                  <Badge variant={notification.is_active ? "default" : "secondary"}>
                    {notification.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {getNotificationTypeLabel(notification.notification_type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(notification.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditNotification(notification)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {notifications.length === 0 && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first customer notification to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Notification
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};