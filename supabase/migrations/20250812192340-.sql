-- Clean up all notifications and keep only the 3 requested ones
DELETE FROM public.customer_notifications;

-- Insert only the 3 requested notification templates
INSERT INTO public.customer_notifications (title, title_ar, title_he, message, message_ar, message_he, notification_type, is_active) VALUES
-- Order Confirmed
('Order Confirmed', 'تم تأكيد الطلب', 'הזמנה אושרה', 
 'Your order #{ORDER_NUMBER} has been confirmed! Total: ₪{AMOUNT}. We''re preparing your items and will keep you updated.',
 'تم تأكيد طلبك رقم #{ORDER_NUMBER}! المجموع: ₪{AMOUNT}. نحن نحضر عناصرك وسنبقيك محدثاً.',
 'הזמנתך מס'' #{ORDER_NUMBER} אושרה! סה"כ: ₪{AMOUNT}. אנו מכינים את הפריטים שלך ונעדכן אותך.',
 'order_confirmed', true),

-- Order Being Processed (3 days after order)
('Order Being Processed', 'جاري معالجة الطلب', 'ההזמנה מעובדת',
 'Hi {CUSTOMER_NAME}! Your order #{ORDER_NUMBER} is currently being processed. We''ll notify you once it ships with tracking details.',
 'مرحباً {CUSTOMER_NAME}! طلبك رقم #{ORDER_NUMBER} قيد المعالجة حالياً. سنبلغك بمجرد شحنه مع تفاصيل التتبع.',
 'היי {CUSTOMER_NAME}! ההזמנה שלך מס'' #{ORDER_NUMBER} מעובדת כעת. נודיע לך ברגע שתישלח עם פרטי המעקב.',
 'order_processing_reminder', true),

-- Order Shipped
('Order Shipped', 'تم شحن الطلب', 'ההזמנה נשלחה',
 'Great news {CUSTOMER_NAME}! Your order #{ORDER_NUMBER} has been shipped and is on its way to you. Tracking: {TRACKING_NUMBER}',
 'أخبار رائعة {CUSTOMER_NAME}! تم شحن طلبك رقم #{ORDER_NUMBER} وهو في طريقه إليك. التتبع: {TRACKING_NUMBER}',
 'חדשות טובות {CUSTOMER_NAME}! ההזמנה שלך מס'' #{ORDER_NUMBER} נשלחה ובדרך אליך. מעקב: {TRACKING_NUMBER}',
 'order_shipped', true);