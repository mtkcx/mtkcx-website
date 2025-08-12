import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Phone, 
  Building, 
  MessageSquare, 
  Clock,
  Reply,
  CheckCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  service_interest?: string;
  status: 'unread' | 'read' | 'replied';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  replied_at?: string;
}

interface ContactMessagesManagerProps {
  isMobile?: boolean;
}

const ContactMessagesManager: React.FC<ContactMessagesManagerProps> = ({ isMobile = false }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data || []) as ContactMessage[]);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string, notes?: string) => {
    setUpdating(true);
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }
      
      if (status === 'replied') {
        updateData.replied_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      await fetchMessages();
      setSelectedMessage(null);
      setAdminNotes('');
      
      toast({
        title: 'Success',
        description: 'Message updated successfully'
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'destructive';
      case 'read': return 'secondary';
      case 'replied': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'replied': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Card className="p-2">
            <div className="text-center">
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </Card>
          <Card className="p-2">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{stats.unread}</div>
              <div className="text-xs text-muted-foreground">Unread</div>
            </div>
          </Card>
        </div>

        {/* Messages List */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {messages.map((message) => (
              <Card 
                key={message.id} 
                className={`p-3 cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                } ${message.status === 'unread' ? 'border-red-200 bg-red-50/50' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(message.status)} className="text-xs">
                      {getStatusIcon(message.status)}
                      <span className="ml-1 capitalize">{message.status}</span>
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-medium">{message.name}</div>
                <div className="text-xs text-muted-foreground">{message.email}</div>
                <div className="text-sm mt-1 font-medium">{message.subject}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {message.message}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Selected Message Details */}
        {selectedMessage && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                <Badge variant={getStatusColor(selectedMessage.status)}>
                  {getStatusIcon(selectedMessage.status)}
                  <span className="ml-1 capitalize">{selectedMessage.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">{selectedMessage.name}</div>
                <div className="text-muted-foreground">{selectedMessage.email}</div>
                {selectedMessage.phone && (
                  <div className="text-muted-foreground">{selectedMessage.phone}</div>
                )}
                {selectedMessage.company && (
                  <div className="text-muted-foreground">{selectedMessage.company}</div>
                )}
              </div>
              
              <Separator />
              
              <div className="text-sm">{selectedMessage.message}</div>
              
              {selectedMessage.service_interest && (
                <div className="text-xs text-muted-foreground">
                  Service Interest: {selectedMessage.service_interest}
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Add admin notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  {selectedMessage.status === 'unread' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMessageStatus(selectedMessage.id, 'read', adminNotes)}
                      disabled={updating}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied', adminNotes)}
                    disabled={updating}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Mark Replied
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
            <div className="text-sm text-muted-foreground">Read</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <div className="text-sm text-muted-foreground">Replied</div>
          </div>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Messages</CardTitle>
          <CardDescription>
            Manage customer contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <Card 
                key={message.id} 
                className={`p-4 ${message.status === 'unread' ? 'border-red-200 bg-red-50/50' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(message.status)}>
                      {getStatusIcon(message.status)}
                      <span className="ml-1 capitalize">{message.status}</span>
                    </Badge>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-lg">{message.subject}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {message.name} ({message.email})
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {message.phone}
                        </div>
                      )}
                      {message.company && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {message.company}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">{message.message}</div>
                    {message.service_interest && (
                      <div className="text-xs text-muted-foreground">
                        Service Interest: {message.service_interest}
                      </div>
                    )}
                    {message.admin_notes && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Admin Notes: {message.admin_notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex gap-2 items-center">
                  {message.status === 'unread' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMessageStatus(message.id, 'read')}
                      disabled={updating}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => updateMessageStatus(message.id, 'replied')}
                    disabled={updating}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Mark as Replied
                  </Button>
                </div>
              </Card>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No contact messages yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactMessagesManager;