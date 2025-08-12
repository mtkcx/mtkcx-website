import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bell, 
  BellRing, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Package,
  Calendar,
  Star,
  Gift,
  Truck,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHaptics } from '@/hooks/useMobileFeatures';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  category: 'order' | 'course' | 'promotion' | 'system';
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const { impact, notification: hapticNotification } = useHaptics();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed and is being processed.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      read: false,
      category: 'order',
      priority: 'high',
      actionUrl: '/orders/12345'
    },
    {
      id: '2',
      type: 'info',
      title: 'Course Reminder',
      message: 'Your "Advanced Detailing Techniques" course starts in 2 hours.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      category: 'course',
      priority: 'medium',
      actionUrl: '/courses'
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Special Offer',
      message: '20% off all Koch-Chemie products this weekend!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      category: 'promotion',
      priority: 'low',
      actionUrl: '/products?category=koch-chemie'
    },
    {
      id: '4',
      type: 'info',
      title: 'Shipment Update',
      message: 'Your order is out for delivery and will arrive today.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      category: 'order',
      priority: 'medium',
      actionUrl: '/tracking'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'course' | 'promotion'>('all');
  const [permissions, setPermissions] = useState<{
    granted: boolean;
    supported: boolean;
  }>({ granted: false, supported: false });

  useEffect(() => {
    // Check notification permissions
    if ('Notification' in window) {
      setPermissions({
        granted: Notification.permission === 'granted',
        supported: true
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications Not Supported',
        description: 'Your browser does not support notifications',
        variant: 'destructive'
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, granted: permission === 'granted' }));
      
      if (permission === 'granted') {
        hapticNotification('success');
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications',
          duration: 2000
        });
      }
    } catch (error) {
      toast({
        title: 'Permission Error',
        description: 'Unable to request notification permission',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    impact('light');
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    impact('medium');
    toast({
      title: 'All Notifications Read',
      duration: 1500
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
    impact('medium');
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      // Navigate to the relevant page
      window.location.href = notification.actionUrl;
    }
    
    hapticNotification('success');
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'order') return <Package className="h-4 w-4" />;
    if (category === 'course') return <Calendar className="h-4 w-4" />;
    if (category === 'promotion') return <Gift className="h-4 w-4" />;
    
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'promotion': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              <DialogTitle>Notifications</DialogTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Notification Permission */}
          {permissions.supported && !permissions.granted && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 text-sm">
                    Enable Push Notifications
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Get instant updates about your orders and courses
                </p>
                <Button
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="w-full"
                >
                  Enable Notifications
                </Button>
              </div>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'order', label: 'Orders', count: notifications.filter(n => n.category === 'order').length },
              { key: 'course', label: 'Courses', count: notifications.filter(n => n.category === 'course').length },
              { key: 'promotion', label: 'Offers', count: notifications.filter(n => n.category === 'promotion').length }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter(tab.key as any);
                  impact('light');
                }}
                className="flex items-center gap-1 flex-shrink-0"
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 w-4 p-0 flex items-center justify-center">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1"
            >
              Mark All Read
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2 overflow-y-auto flex-1">
            {filteredNotifications.length === 0 ? (
              <Card className="p-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </Card>
            ) : (
              filteredNotifications.map((notif) => (
                <Card
                  key={notif.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-primary/5 border-primary/20' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={getNotificationColor(notif.type)}>
                          {getNotificationIcon(notif.type, notif.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {notif.category}
                        </Badge>
                        {notif.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};