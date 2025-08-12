-- Add automated notification templates for order processing reminders and shipping notifications

-- Insert automated notification templates
INSERT INTO public.customer_notifications (title, title_ar, title_he, message, message_ar, message_he, notification_type, is_active) VALUES
-- Order Processing Reminder (3 days after order)
('Order Processing Update', 'تحديث معالجة الطلب', 'עדכון עיבוד הזמנה',
 'Hi {CUSTOMER_NAME}! Your order #{ORDER_NUMBER} is being processed by our team. We''ll ship it soon and notify you with tracking details. Thank you for your patience!',
 'مرحباً {CUSTOMER_NAME}! طلبك رقم #{ORDER_NUMBER} قيد المعالجة من قبل فريقنا. سنقوم بشحنه قريباً وسنبلغك بتفاصيل التتبع. شكراً لصبرك!',
 'היי {CUSTOMER_NAME}! ההזמנה שלך מס'' #{ORDER_NUMBER} מעובדת על ידי הצוות שלנו. נשלח אותה בקרוב ונודיע לך עם פרטי המעקב. תודה על הסבלנות!',
 'order_processing_reminder', true),

-- Order Out for Delivery
('Out for Delivery!', 'في الطريق للتوصيل!', 'יוצא למשלוח!',
 '📦 Exciting news {CUSTOMER_NAME}! Your order #{ORDER_NUMBER} is out for delivery and will arrive today. Please be available to receive your Koch-Chemie products!',
 '📦 أخبار مثيرة {CUSTOMER_NAME}! طلبك رقم #{ORDER_NUMBER} في الطريق للتوصيل وسيصل اليوم. يرجى التواجد لاستقبال منتجات كوخ-كيمي الخاصة بك!',
 '📦 חדשות מרגשות {CUSTOMER_NAME}! ההזמנה שלך מס'' #{ORDER_NUMBER} יוצאת למשלוח ותגיע היום. אנא היה זמין לקבל את מוצרי קוך-כימי שלך!',
 'out_for_delivery', true),

-- Follow-up After Delivery
('How was your experience?', 'كيف كانت تجربتك؟', 'איך הייתה החוויה שלך?',
 'Hi {CUSTOMER_NAME}! We hope you''re loving your Koch-Chemie products from order #{ORDER_NUMBER}. Rate your experience and get 10% off your next purchase!',
 'مرحباً {CUSTOMER_NAME}! نأمل أن تحب منتجات كوخ-كيمي من الطلب رقم #{ORDER_NUMBER}. قيّم تجربتك واحصل على خصم 10% على مشترياتك التالية!',
 'היי {CUSTOMER_NAME}! אנו מקווים שאתה אוהב את מוצרי קוך-כימי מההזמנה מס'' #{ORDER_NUMBER}. דרג את החוויה שלך וקבל 10% הנחה על הרכישה הבאה!',
 'delivery_followup', true),

-- Abandoned Cart Reminder
('Items Waiting for You', 'عناصر تنتظرك', 'פריטים מחכים לך',
 'Hi {CUSTOMER_NAME}! You left some amazing Koch-Chemie products in your cart. Complete your purchase now and get free shipping on orders over ₪200!',
 'مرحباً {CUSTOMER_NAME}! تركت بعض منتجات كوخ-كيمي الرائعة في سلتك. أكمل شراءك الآن واحصل على شحن مجاني للطلبات التي تزيد عن ₪200!',
 'היי {CUSTOMER_NAME}! השארת כמה מוצרי קוך-כימי מדהימים בעגלה. השלם את הרכישה עכשיו וקבל משלוח חינם על הזמנות מעל ₪200!',
 'cart_abandonment', true),

-- Restock Notification
('Product Back in Stock!', 'المنتج متوفر مرة أخرى!', 'המוצר חזר למלאי!',
 'Great news {CUSTOMER_NAME}! The Koch-Chemie product you were interested in is back in stock. Get it now before it sells out again!',
 'أخبار رائعة {CUSTOMER_NAME}! منتج كوخ-كيمي الذي كنت مهتماً به متوفر مرة أخرى في المخزون. احصل عليه الآن قبل أن ينفد مرة أخرى!',
 'חדשות טובות {CUSTOMER_NAME}! מוצר קוך-כימי שעניין אותך חזר למלאי. קבל אותו עכשיו לפני שיגמר שוב!',
 'restock_notification', true);