-- Remove all the extra templates and keep only the 3 requested ones
DELETE FROM public.customer_notifications WHERE notification_type IN (
  'delivery_followup', 
  'cart_abandonment', 
  'restock_notification', 
  'appointment_reminder', 
  'welcome', 
  'promotion'
);

-- Update the order processing reminder to be more specific
UPDATE public.customer_notifications 
SET 
  title = 'Order Being Processed',
  title_ar = 'جاري معالجة الطلب',
  title_he = 'ההזמנה מעובדת',
  message = 'Hi {CUSTOMER_NAME}! Your order #{ORDER_NUMBER} is currently being processed. We''ll notify you once it ships with tracking details.',
  message_ar = 'مرحباً {CUSTOMER_NAME}! طلبك رقم #{ORDER_NUMBER} قيد المعالجة حالياً. سنبلغك بمجرد شحنه مع تفاصيل التتبع.',
  message_he = 'היי {CUSTOMER_NAME}! ההזמנה שלך מס'' #{ORDER_NUMBER} מעובדת כעת. נודיע לך ברגע שתישלח עם פרטי המעקב.'
WHERE notification_type = 'order_processing_reminder';

-- Rename the out_for_delivery to order_shipped
UPDATE public.customer_notifications 
SET 
  notification_type = 'order_shipped',
  title = 'Order Shipped',
  title_ar = 'تم شحن الطلب',
  title_he = 'ההזמנה נשלחה',
  message = 'Great news {CUSTOMER_NAME}! Your order #{ORDER_NUMBER} has been shipped and is on its way to you. Tracking: {TRACKING_NUMBER}',
  message_ar = 'أخبار رائعة {CUSTOMER_NAME}! تم شحن طلبك رقم #{ORDER_NUMBER} وهو في طريقه إليك. التتبع: {TRACKING_NUMBER}',
  message_he = 'חדשות טובות {CUSTOMER_NAME}! ההזמנה שלך מס'' #{ORDER_NUMBER} נשלחה ובדרך אליך. מעקב: {TRACKING_NUMBER}'
WHERE notification_type = 'out_for_delivery';