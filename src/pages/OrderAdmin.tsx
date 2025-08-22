import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Search, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Filter,
  Download,
  Send,
  Trash2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  amount: number;
  currency: string;
  status: string;
  order_type: string;
  payment_gateway: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_country: string | null;
  service_type: string | null;
  service_description: string | null;
  notes: string | null;
  items: any;
  preferred_date: string | null;
  payment_session_id: string | null;
  payment_intent_id: string | null;
  tracking_number: string | null;
  tracking_date: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_id: string | null;
  variant_size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

const OrderAdmin = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [orderId: string]: OrderItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    carrierName: '',
    trackingUrl: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: t('admin.error'),
          description: t('admin.orders.fetch_error'),
          variant: 'destructive',
        });
        return;
      }

      setOrders(ordersData || []);

      // Fetch order items for all orders
      const orderIds = ordersData?.map(order => order.id) || [];
      if (orderIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (!itemsError && itemsData) {
          const itemsByOrder = itemsData.reduce((acc, item) => {
            if (!acc[item.order_id]) {
              acc[item.order_id] = [];
            }
            acc[item.order_id].push(item);
            return acc;
          }, {} as { [orderId: string]: OrderItem[] });
          
          setOrderItems(itemsByOrder);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: t('admin.error'),
        description: t('admin.orders.fetch_error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // First, make sure we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('admin.error'),
          description: 'Please log in to update order status',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) {
        console.error('Status update error:', error);
        toast({
          title: t('admin.error'),
          description: `Error updating status: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('admin.success'),
        description: t('admin.orders.status_updated'),
      });

      // Update the local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Send status update notification email to customer
      try {
        const { error: notificationError } = await supabase.functions.invoke('send-order-notification', {
          body: {
            orderId: orderId,
            newStatus: newStatus,
            orderNumber: orders.find(o => o.id === orderId)?.order_number || '',
            customerEmail: orders.find(o => o.id === orderId)?.email || ''
          }
        });

        if (notificationError) {
          console.error('Failed to send status notification:', notificationError);
          // Don't show error to admin, as this is supplementary
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      // Also refresh from database to ensure sync
      setTimeout(() => fetchOrders(), 500);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: t('admin.error'),
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleSendTrackingEmail = async () => {
    if (!selectedOrder || !trackingData.trackingNumber) {
      toast({
        title: 'Error',
        description: 'Please enter a tracking number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-tracking-email', {
        body: {
          orderId: selectedOrder.id,
          trackingNumber: trackingData.trackingNumber,
          carrierName: trackingData.carrierName || undefined,
          trackingUrl: trackingData.trackingUrl || undefined
        }
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send tracking email',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Tracking email sent successfully',
      });

      setShowTrackingDialog(false);
      setTrackingData({
        trackingNumber: '',
        carrierName: '',
        trackingUrl: ''
      });
      fetchOrders();
    } catch (error) {
      console.error('Error sending tracking email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send tracking email',
        variant: 'destructive',
      });
    }
  };

  const handleSendTrackingInfo = async () => {
    if (!selectedOrder || !trackingData.trackingNumber) {
      toast({
        title: t('admin.error'),
        description: t('admin.orders.tracking_required'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-tracking-email', {
        body: {
          orderId: selectedOrder.id,
          trackingNumber: trackingData.trackingNumber,
          carrierName: trackingData.carrierName || 'Courier Service',
          trackingUrl: trackingData.trackingUrl || ''
        }
      });

      if (error) {
        toast({
          title: t('admin.error'),
          description: t('admin.orders.tracking_send_error'),
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('admin.success'),
        description: t('admin.orders.tracking_sent'),
      });

      setShowTrackingDialog(false);
      setTrackingData({ trackingNumber: '', carrierName: '', trackingUrl: '' });
      fetchOrders();
    } catch (error) {
      console.error('Error sending tracking info:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('admin.error'),
          description: 'Please log in to delete orders',
          variant: 'destructive',
        });
        return;
      }

      // Delete order items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        toast({
          title: t('admin.error'),
          description: `Error deleting order items: ${itemsError.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        toast({
          title: t('admin.error'),
          description: `Error deleting order: ${orderError.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('admin.success'),
        description: `Order ${orderNumber} has been deleted successfully`,
      });

      // Update local state immediately
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setOrderItems(prevItems => {
        const newItems = { ...prevItems };
        delete newItems[orderId];
        return newItems;
      });

    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: t('admin.error'),
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ILS') => {
    return new Intl.NumberFormat(t('common.locale'), {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getOrderTotal = (orderId: string) => {
    const items = orderItems[orderId] || [];
    return items.reduce((total, item) => total + item.total_price, 0);
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {t('admin.orders.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('admin.orders.description')}
                </p>
              </div>
              <Badge variant="outline" className="px-4 py-2">
                {filteredOrders.length} {t('admin.orders.total_orders')}
              </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{t('admin.orders.pending')}</p>
                      <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{t('admin.orders.processing')}</p>
                      <p className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Truck className="w-8 h-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{t('admin.orders.shipped')}</p>
                      <p className="text-2xl font-bold">{orders.filter(o => o.status === 'shipped').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{t('admin.orders.delivered')}</p>
                      <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder={t('admin.orders.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder={t('admin.orders.filter_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.orders.all_statuses')}</SelectItem>
                      <SelectItem value="pending">{t('admin.orders.pending')}</SelectItem>
                      <SelectItem value="processing">{t('admin.orders.processing')}</SelectItem>
                      <SelectItem value="shipped">{t('admin.orders.shipped')}</SelectItem>
                      <SelectItem value="delivered">{t('admin.orders.delivered')}</SelectItem>
                      <SelectItem value="cancelled">{t('admin.orders.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('admin.orders.no_orders')}</h3>
                    <p className="text-muted-foreground">{t('admin.orders.no_orders_desc')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.orders.table.order_number')}</TableHead>
                        <TableHead>{t('admin.orders.table.customer')}</TableHead>
                        <TableHead>{t('admin.orders.table.type')}</TableHead>
                        <TableHead>{t('admin.orders.table.amount')}</TableHead>
                        <TableHead>{t('admin.orders.table.status')}</TableHead>
                        <TableHead>{t('admin.orders.table.date')}</TableHead>
                         <TableHead>{t('admin.orders.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name || order.email}</p>
                              <p className="text-sm text-muted-foreground">{order.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {order.order_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(order.amount, order.currency)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              <Badge className={getStatusColor(order.status)}>
                                {t(`admin.orders.${order.status}`)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(order.created_at)}
                          </TableCell>
                           <TableCell>
                             <div className="flex items-center space-x-2">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   setSelectedOrder(order);
                                   setShowDetailsDialog(true);
                                 }}
                                 title="View Details"
                               >
                                 <Eye className="w-4 h-4" />
                               </Button>
                               <Select
                                 value={order.status}
                                 onValueChange={(value) => handleStatusUpdate(order.id, value)}
                               >
                                 <SelectTrigger className="w-32">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="pending">{t('admin.orders.pending')}</SelectItem>
                                   <SelectItem value="processing">{t('admin.orders.processing')}</SelectItem>
                                   <SelectItem value="shipped">{t('admin.orders.shipped')}</SelectItem>
                                   <SelectItem value="delivered">{t('admin.orders.delivered')}</SelectItem>
                                   <SelectItem value="cancelled">{t('admin.orders.cancelled')}</SelectItem>
                                 </SelectContent>
                               </Select>
                               {(order.status === 'processing' || order.status === 'shipped') && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     setSelectedOrder(order);
                                     setShowTrackingDialog(true);
                                   }}
                                   title="Send Tracking"
                                 >
                                   <Send className="w-4 h-4" />
                                 </Button>
                               )}
                               {/* DELETE ORDER BUTTON */}
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleDeleteOrder(order.id, order.order_number)}
                                 className="text-destructive hover:text-destructive-foreground hover:bg-destructive border-destructive"
                                 title="Delete Order"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                             </div>
                           </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {t('admin.orders.order_details')} - {selectedOrder?.order_number}
                  </DialogTitle>
                </DialogHeader>
                {selectedOrder && (
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            {t('admin.orders.customer_info')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{selectedOrder.customer_name || t('admin.orders.no_name')}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{selectedOrder.email}</span>
                          </div>
                          {selectedOrder.customer_phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{selectedOrder.customer_phone}</span>
                            </div>
                          )}
                          {selectedOrder.customer_address && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                              <div>
                                <p>{selectedOrder.customer_address}</p>
                                <p>{selectedOrder.customer_city}, {selectedOrder.customer_country}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Order Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            {t('admin.orders.order_info')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.orders.order_type')}:</span>
                            <Badge>{selectedOrder.order_type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.orders.status')}:</span>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(selectedOrder.status)}
                              <Badge className={getStatusColor(selectedOrder.status)}>
                                {t(`admin.orders.${selectedOrder.status}`)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.orders.total_amount')}:</span>
                            <span className="font-semibold">{formatCurrency(selectedOrder.amount, selectedOrder.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.orders.payment_method')}:</span>
                            <span>{selectedOrder.payment_gateway}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('admin.orders.date_created')}:</span>
                            <span>{formatDate(selectedOrder.created_at)}</span>
                          </div>
                          {selectedOrder.preferred_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('admin.orders.preferred_date')}:</span>
                              <span>{formatDate(selectedOrder.preferred_date)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Service Information (for service orders) */}
                    {selectedOrder.order_type === 'service' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            {t('admin.orders.service_details')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedOrder.service_type && (
                            <div>
                              <span className="text-muted-foreground font-medium">{t('admin.orders.service_type')}:</span>
                              <p>{selectedOrder.service_type}</p>
                            </div>
                          )}
                          {selectedOrder.service_description && (
                            <div>
                              <span className="text-muted-foreground font-medium">{t('admin.orders.service_description')}:</span>
                              <p>{selectedOrder.service_description}</p>
                            </div>
                          )}
                          {selectedOrder.notes && (
                            <div>
                              <span className="text-muted-foreground font-medium">{t('admin.orders.notes')}:</span>
                              <p>{selectedOrder.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Order Items (for product orders) */}
                    {selectedOrder.order_type === 'product' && orderItems[selectedOrder.id] && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            {t('admin.orders.order_items')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t('admin.orders.table.product')}</TableHead>
                                <TableHead>{t('admin.orders.table.variant')}</TableHead>
                                <TableHead>{t('admin.orders.table.quantity')}</TableHead>
                                <TableHead>{t('admin.orders.table.unit_price')}</TableHead>
                                <TableHead>{t('admin.orders.table.total')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderItems[selectedOrder.id].map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.product_name}</TableCell>
                                  <TableCell>{item.variant_size || '-'}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{formatCurrency(item.unit_price, selectedOrder.currency)}</TableCell>
                                  <TableCell>{formatCurrency(item.total_price, selectedOrder.currency)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Tracking Information Dialog */}
            <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t('admin.orders.send_tracking')} - {selectedOrder?.order_number}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trackingNumber">{t('admin.orders.tracking_number')}</Label>
                    <Input
                      id="trackingNumber"
                      value={trackingData.trackingNumber}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      placeholder={t('admin.orders.tracking_number_placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carrierName">{t('admin.orders.carrier_name')}</Label>
                    <Input
                      id="carrierName"
                      value={trackingData.carrierName}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, carrierName: e.target.value }))}
                      placeholder={t('admin.orders.carrier_name_placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingUrl">{t('admin.orders.tracking_url')}</Label>
                    <Input
                      id="trackingUrl"
                      value={trackingData.trackingUrl}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, trackingUrl: e.target.value }))}
                      placeholder={t('admin.orders.tracking_url_placeholder')}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowTrackingDialog(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSendTrackingInfo}>
                      <Send className="w-4 h-4 mr-2" />
                      {t('admin.orders.send_tracking_email')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Footer />
      </div>
    </AdminProtectedRoute>
  );
};

export default OrderAdmin;