import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotificationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  language: string;
  totalAmount: number;
  orderItems: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      orderId, 
      customerEmail, 
      customerName, 
      customerPhone,
      language, 
      totalAmount, 
      orderItems 
    }: OrderNotificationRequest = await req.json();

    console.log('Processing order notification for:', { orderId, customerEmail, language });

    // Get notification messages based on language
    const messages = getOrderConfirmationMessages(language);
    
    // Create notification record
    const { error: notificationError } = await supabaseClient
      .from('sent_notifications')
      .insert({
        order_id: orderId,
        device_id: `order_${orderId}`, // For guest orders
        title: messages.title.replace('{customerName}', customerName),
        message: messages.message
          .replace('{customerName}', customerName)
          .replace('{totalAmount}', `₪${totalAmount.toLocaleString()}`),
        language: language,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error saving notification:', notificationError);
    }

    // Here you would integrate with your SMS/Push notification service
    // For now, we'll just log the notification
    console.log('Order confirmation notification sent:', {
      to: customerEmail,
      phone: customerPhone,
      title: messages.title.replace('{customerName}', customerName),
      message: messages.message
        .replace('{customerName}', customerName)
        .replace('{totalAmount}', `₪${totalAmount.toLocaleString()}`),
      language: language
    });

    // Simulate SMS sending success (replace with actual SMS service)
    const smsResult = {
      success: true,
      messageId: `msg_${Date.now()}`,
      message: 'Notification sent successfully'
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationSent: smsResult,
        language: language 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-order-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function getOrderConfirmationMessages(language: string) {
  const messages = {
    en: {
      title: 'Order Confirmed - {customerName}',
      message: 'Hi {customerName}! Your order has been confirmed (Total: {totalAmount}). Your order will be processed within 3-5 business days and delivered within 7-10 business days. Thank you for choosing MT KCx!'
    },
    ar: {
      title: 'تم تأكيد الطلب - {customerName}',
      message: 'مرحباً {customerName}! تم تأكيد طلبك (المجموع: {totalAmount}). سيتم معالجة طلبك خلال 3-5 أيام عمل وسيتم التسليم خلال 7-10 أيام عمل. شكراً لاختيارك MT KCx!'
    },
    he: {
      title: 'הזמנה אושרה - {customerName}',
      message: 'שלום {customerName}! ההזמנה שלך אושרה (סה"כ: {totalAmount}). ההזמנה תעובד תוך 3-5 ימי עסקים ותסופק תוך 7-10 ימי עסקים. תודה שבחרת ב-MT KCx!'
    }
  };

  return messages[language as keyof typeof messages] || messages.en;
}

serve(handler);