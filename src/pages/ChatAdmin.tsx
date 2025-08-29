import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, User, Clock, Send, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

interface Conversation {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  language: string;
  status: string;
  admin_user_id: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'bot' | 'admin';
  sender_name: string | null;
  message: string;
  language: string;
  created_at: string;
}

const ChatAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
    
    // Set up realtime subscriptions
    const conversationsChannel = supabase
      .channel('chat-conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_messages(count)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithCount = data?.map(conv => ({
        ...conv,
        message_count: conv.chat_messages?.[0]?.count || 0
      })) || [];

      setConversations(conversationsWithCount);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const takeOverConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ 
          admin_user_id: user?.id,
          status: 'admin_active'
        })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've taken over this conversation",
      });

      fetchConversations();
    } catch (error) {
      console.error('Error taking over conversation:', error);
      toast({
        title: "Error",
        description: "Failed to take over conversation",
        variant: "destructive",
      });
    }
  };

  const sendAdminMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: 'admin',
          sender_name: user?.email || 'Admin',
          message: newMessage.trim(),
          language: selectedConversation.language
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent to the customer",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'admin_active': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getSenderColor = (senderType: string) => {
    switch (senderType) {
      case 'customer': return 'bg-blue-100 text-blue-900';
      case 'admin': return 'bg-purple-100 text-purple-900';
      case 'bot': return 'bg-gray-100 text-gray-900';
      default: return 'bg-gray-100 text-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading chat conversations...</div>
      </div>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto p-6 h-screen flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Chat Administration</h1>
          <p className="text-muted-foreground">Monitor and manage customer conversations</p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations ({conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 lg:h-[calc(100vh-250px)]">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate">
                            {conversation.customer_name || conversation.customer_email || 'Anonymous'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          {format(new Date(conversation.last_message_at), 'MMM d, HH:mm')}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(conversation.status)} text-white`}>
                            {conversation.status}
                          </Badge>
                          <Badge variant="outline">
                            {conversation.language.toUpperCase()}
                          </Badge>
                          {conversation.admin_user_id && (
                            <UserCheck className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              {selectedConversation ? (
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedConversation.customer_name || selectedConversation.customer_email || 'Anonymous'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.customer_email}
                    </p>
                  </div>
                  
                  {!selectedConversation.admin_user_id && (
                    <Button
                      onClick={() => takeOverConversation(selectedConversation.id)}
                      variant="outline"
                      size="sm"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Take Over
                    </Button>
                  )}
                </div>
              ) : (
                <CardTitle>Select a conversation</CardTitle>
              )}
            </CardHeader>
            
            <CardContent className="flex flex-col h-96 lg:h-[calc(100vh-250px)]">
              {selectedConversation ? (
                <>
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${getSenderColor(message.sender_type)}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.sender_name || message.sender_type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {selectedConversation.admin_user_id === user?.id && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                        />
                        <Button onClick={sendAdminMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a conversation to view messages
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtectedRoute>
  );
};

export default ChatAdmin;