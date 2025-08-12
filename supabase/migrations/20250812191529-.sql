-- Insert default SMS notification templates for customer messaging
INSERT INTO public.customer_notifications (title, title_ar, title_he, message, message_ar, message_he, notification_type, is_active) VALUES
-- Order Confirmed
('Order Confirmed', 'تم تأكيد الطلب', 'הזמנה אושרה', 
 'Your order #{ORDER_NUMBER} has been confirmed! Total: ₪{AMOUNT}. We''re preparing your items and will keep you updated.', 
 'تم تأكيد طلبك رقم #{ORDER_NUMBER}! المجموع: ₪{AMOUNT}. نحن نحضر عناصرك وسنبقيك محدثاً.',
 'הזמנתך מס'' #{ORDER_NUMBER} אושרה! סה"כ: ₪{AMOUNT}. אנו מכינים את הפריטים שלך ונעדכן אותך.',
 'order_confirmed', true),

-- Order Shipped
('Order Shipped', 'تم شحن الطلب', 'הזמנה נשלחה',
 'Great news! Your order #{ORDER_NUMBER} is on its way 🚚. Track your package: {TRACKING_NUMBER}',
 'أخبار رائعة! طلبك رقم #{ORDER_NUMBER} في الطريق 🚚. تتبع حزمتك: {TRACKING_NUMBER}',
 'חדשות טובות! הזמנתך מס'' #{ORDER_NUMBER} בדרך 🚚. עקוב אחר החבילה: {TRACKING_NUMBER}',
 'order_shipped', true),

-- Order Delivered
('Order Delivered', 'تم توصيل الطلب', 'הזמנה נמסרה',
 'Your order #{ORDER_NUMBER} has been delivered! We hope you love your Koch-Chemie products. Thank you for choosing MTKCx!',
 'تم توصيل طلبك رقم #{ORDER_NUMBER}! نأمل أن تحب منتجات كوخ-كيمي. شكراً لاختيار MTKCx!',
 'הזמנתך מס'' #{ORDER_NUMBER} נמסרה! אנו מקווים שתאהב את מוצרי קוך-כימי. תודה שבחרת ב-MTKCx!',
 'order_delivered', true),

-- Payment Received
('Payment Received', 'تم استلام الدفع', 'תשלום התקבל',
 'Payment received for order #{ORDER_NUMBER}. Amount: ₪{AMOUNT}. Your order will be processed shortly.',
 'تم استلام الدفعة للطلب رقم #{ORDER_NUMBER}. المبلغ: ₪{AMOUNT}. سيتم معالجة طلبك قريباً.',
 'התקבל תשלום עבור הזמנה מס'' #{ORDER_NUMBER}. סכום: ₪{AMOUNT}. ההזמנה שלך תטופל בקרוב.',
 'payment_received', true),

-- Appointment Reminder
('Appointment Reminder', 'تذكير بالموعد', 'תזכורת פגישה',
 'Reminder: Your appointment with MTKCx is tomorrow at {TIME}. Location: Atarot Industrial Area, Jerusalem.',
 'تذكير: موعدك مع MTKCx غداً في {TIME}. الموقع: المنطقة الصناعية عطروت، القدس.',
 'תזכורת: הפגישה שלך עם MTKCx מחר בשעה {TIME}. מיקום: אזור התעשייה עטרות, ירושלים.',
 'appointment_reminder', true),

-- Welcome Message
('Welcome to MTKCx!', 'أهلاً بك في MTKCx!', 'ברוכים הבאים ל-MTKCx!',
 'Welcome to MTKCx family! 🎉 Your account has been created. Explore our Koch-Chemie products and professional services.',
 'أهلاً بك في عائلة MTKCx! 🎉 تم إنشاء حسابك. استكشف منتجات كوخ-كيمي وخدماتنا المهنية.',
 'ברוכים הבאים למשפחת MTKCx! 🎉 החשבון שלך נוצר. גלה את מוצרי קוך-כימי והשירותים המקצועיים שלנו.',
 'welcome', true),

-- Promotion
('Special Offer!', 'عرض خاص!', 'הצעה מיוחדת!',
 '🔥 Limited time offer! Get 20% off on Koch-Chemie products. Use code: SAVE20. Valid until {DATE}.',
 '🔥 عرض لفترة محدودة! احصل على خصم 20% على منتجات كوخ-كيمي. استخدم الكود: SAVE20. صالح حتى {DATE}.',
 '🔥 הצעה מוגבלת בזמן! קבל 20% הנחה על מוצרי קוך-כימי. השתמש בקוד: SAVE20. תקף עד {DATE}.',
 'promotion', true),

-- Order Cancelled
('Order Cancelled', 'تم إلغاء الطلب', 'הזמנה בוטלה',
 'Your order #{ORDER_NUMBER} has been cancelled as requested. Refund will be processed within 3-5 business days.',
 'تم إلغاء طلبك رقم #{ORDER_NUMBER} كما طلبت. سيتم معالجة الاسترداد خلال 3-5 أيام عمل.',
 'הזמנתך מס'' #{ORDER_NUMBER} בוטלה כפי שביקשת. ההחזר יעובד תוך 3-5 ימי עסקים.',
 'order_cancelled', true);