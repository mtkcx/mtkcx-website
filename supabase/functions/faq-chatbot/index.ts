import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FAQ Knowledge Base
const faqData = {
  en: {
    welcome: "Hello! I'm MT Support, here to help you with questions about MT Wraps. Ask me about our location, courses, products, or services!",
    fallback: "I'm sorry, I didn't understand your question. Please contact our support team at info@mtkcx.com for personalized assistance.",
    patterns: {
      location: {
        keywords: ['location', 'where', 'address', 'find you', 'located', 'office'],
        answer: "We are located in Israel. For our exact address and directions, please contact us at info@mtkcx.com or call us during business hours: Sunday-Thursday 9:00-18:00, Friday 9:00-14:00."
      },
      courses: {
        keywords: ['course', 'training', 'certification', 'learn', 'register', 'enroll', 'class', 'workshop'],
        answer: "We offer professional detailing and polishing certification courses. To register for our courses, please visit our Courses page or contact us at info@mtkcx.com. We provide hands-on training with Koch-Chemie products."
      },
      products: {
        keywords: ['product', 'buy', 'purchase', 'price', 'cost', 'koch-chemie', 'chemical', 'detailing'],
        answer: "We are an official Koch-Chemie distribution partner offering high-quality car care products from Germany. You can browse our products on our website or contact us for specific product information and pricing."
      },
      shipping: {
        keywords: ['shipping', 'delivery', 'ship', 'send', 'postal', 'mail'],
        answer: "We offer shipping within Israel only. Orders are processed within 3-5 business days, and delivery takes 7-10 business days. All shipping costs are calculated at checkout."
      },
      payment: {
        keywords: ['payment', 'pay', 'card', 'paypal', 'stripe', 'method'],
        answer: "We accept multiple payment methods including Stripe and PayPal. All transactions are secure and processed in Israeli Shekel (₪)."
      },
      contact: {
        keywords: ['contact', 'phone', 'email', 'reach', 'talk', 'speak'],
        answer: "Contact us at info@mtkcx.com or during business hours: Sunday-Thursday 9:00-18:00, Friday 9:00-14:00. We're here to help with any questions!"
      },
      hours: {
        keywords: ['hours', 'time', 'open', 'close', 'when', 'schedule'],
        answer: "Our business hours are: Sunday-Thursday 9:00-18:00, Friday 9:00-14:00. We're closed on Saturdays."
      },
      warranty: {
        keywords: ['warranty', 'guarantee', 'return', 'refund', 'policy'],
        answer: "We offer a 1-year warranty on all products and a 30-day return policy. Our wrapping services come with a quality guarantee."
      }
    }
  },
  he: {
    welcome: "שלום! אני MT Support, כאן לעזור לך עם שאלות על MT Wraps. שאל אותי על המיקום שלנו, קורסים, מוצרים או שירותים!",
    fallback: "מצטער, לא הבנתי את השאלה שלך. אנא צור קשר עם צוות התמיכה שלנו בכתובת info@mtkcx.com לסיוע אישי.",
    patterns: {
      location: {
        keywords: ['מיקום', 'איפה', 'כתובת', 'למצוא', 'נמצא', 'משרד', 'היכן'],
        answer: "אנחנו נמצאים בישראל. לכתובת המדויקת והנחיות הגעה, אנא צור קשר בכתובת info@mtkcx.com או התקשר בשעות העבודה: ראשון-חמישי 9:00-18:00, שישי 9:00-14:00."
      },
      courses: {
        keywords: ['קורס', 'הכשרה', 'הסמכה', 'ללמוד', 'להירשם', 'כיתה', 'סדנה', 'לימודים'],
        answer: "אנו מציעים קורסי הסמכה מקצועיים לליטוש וניקוי. להרשמה לקורסים שלנו, בקר בעמוד הקורסים או צור קשר בכתובת info@mtkcx.com. אנו מספקים הכשרה מעשית עם מוצרי Koch-Chemie."
      },
      products: {
        keywords: ['מוצר', 'לקנות', 'רכישה', 'מחיר', 'עלות', 'koch-chemie', 'כימיקל', 'ניקוי'],
        answer: "אנחנו שותפי הפצה רשמיים של Koch-Chemie המציעים מוצרי טיפוח רכב איכותיים מגרמניה. אתה יכול לדפדף במוצרים שלנו באתר או לפנות אלינו למידע ומחירים ספציפיים."
      },
      shipping: {
        keywords: ['משלוח', 'רכש', 'לשלוח', 'דואר', 'הובלה'],
        answer: "אנו מציעים משלוחים בישראל בלבד. הזמנות מעובדות תוך 3-5 ימי עסקים, והמשלוח לוקח 7-10 ימי עסקים. כל עלויות המשלוח מחושבות בקופה."
      },
      payment: {
        keywords: ['תשלום', 'לשלם', 'כרטיס', 'paypal', 'stripe', 'אמצעי'],
        answer: "אנו מקבלים מספר אמצעי תשלום כולל Stripe ו-PayPal. כל העסקאות מאובטחות ומעובדות בשקל ישראלי (₪)."
      },
      contact: {
        keywords: ['קשר', 'טלפון', 'אימייל', 'להגיע', 'לדבר', 'ליצור קשר'],
        answer: "צור קשר בכתובת info@mtkcx.com או בשעות העבודה: ראשון-חמישי 9:00-18:00, שישי 9:00-14:00. אנחנו כאן לעזור עם כל שאלה!"
      },
      hours: {
        keywords: ['שעות', 'זמן', 'פתוח', 'סגור', 'מתי', 'לוח זמנים'],
        answer: "שעות העבודה שלנו: ראשון-חמישי 9:00-18:00, שישי 9:00-14:00. אנחנו סגורים בשבתות."
      },
      warranty: {
        keywords: ['אחריות', 'גרנטי', 'החזרה', 'החזר כספי', 'מדיניות'],
        answer: "אנו מציעים אחריות של שנה על כל המוצרים ומדיניות החזרה של 30 יום. שירותי העטיפה שלנו מגיעים עם ערבות איכות."
      }
    }
  },
  ar: {
    welcome: "مرحباً! أنا MT Support، هنا لمساعدتك في الأسئلة حول MT Wraps. اسألني عن موقعنا، الدورات، المنتجات أو الخدمات!",
    fallback: "آسف، لم أفهم سؤالك. يرجى الاتصال بفريق الدعم على info@mtkcx.com للحصول على مساعدة شخصية.",
    patterns: {
      location: {
        keywords: ['موقع', 'أين', 'عنوان', 'العثور', 'موجود', 'مكتب', 'مكان'],
        answer: "نحن موجودون في إسرائيل. للعنوان الدقيق والاتجاهات، يرجى الاتصال بنا على info@mtkcx.com أو الاتصال خلال ساعات العمل: الأحد-الخميس 9:00-18:00، الجمعة 9:00-14:00."
      },
      courses: {
        keywords: ['دورة', 'تدريب', 'شهادة', 'تعلم', 'تسجيل', 'صف', 'ورشة عمل', 'دراسة'],
        answer: "نحن نقدم دورات شهادة مهنية للتلميع والتنظيف. للتسجيل في دوراتنا، قم بزيارة صفحة الدورات أو اتصل بنا على info@mtkcx.com. نحن نقدم تدريباً عملياً مع منتجات Koch-Chemie."
      },
      products: {
        keywords: ['منتج', 'شراء', 'شراء', 'سعر', 'تكلفة', 'koch-chemie', 'كيميائي', 'تنظيف'],
        answer: "نحن شركاء توزيع رسميون لـ Koch-Chemie نقدم منتجات عناية بالسيارات عالية الجودة من ألمانيا. يمكنك تصفح منتجاتنا على موقعنا أو الاتصال بنا للحصول على معلومات وأسعار محددة."
      },
      shipping: {
        keywords: ['شحن', 'توصيل', 'إرسال', 'بريد', 'نقل'],
        answer: "نحن نقدم الشحن داخل إسرائيل فقط. يتم معالجة الطلبات خلال 3-5 أيام عمل، ويستغرق التسليم 7-10 أيام عمل. يتم حساب جميع تكاليف الشحن عند الدفع."
      },
      payment: {
        keywords: ['دفع', 'يدفع', 'بطاقة', 'paypal', 'stripe', 'طريقة'],
        answer: "نحن نقبل طرق دفع متعددة بما في ذلك Stripe و PayPal. جميع المعاملات آمنة ومعالجة بالشيكل الإسرائيلي (₪)."
      },
      contact: {
        keywords: ['اتصال', 'هاتف', 'إيميل', 'الوصول', 'تحدث', 'تواصل'],
        answer: "اتصل بنا على info@mtkcx.com أو خلال ساعات العمل: الأحد-الخميس 9:00-18:00، الجمعة 9:00-14:00. نحن هنا للمساعدة في أي سؤال!"
      },
      hours: {
        keywords: ['ساعات', 'وقت', 'مفتوح', 'مغلق', 'متى', 'جدولة'],
        answer: "ساعات عملنا: الأحد-الخميس 9:00-18:00، الجمعة 9:00-14:00. نحن مغلقون أيام السبت."
      },
      warranty: {
        keywords: ['ضمان', 'كفالة', 'إرجاع', 'استرداد', 'سياسة'],
        answer: "نحن نقدم ضماناً لمدة سنة على جميع المنتجات وسياسة إرجاع لمدة 30 يوماً. خدمات التغليف لدينا تأتي مع ضمان الجودة."
      }
    }
  }
};

function findBestMatch(message: string, language: string): string {
  const lang = faqData[language as keyof typeof faqData] || faqData.en;
  const lowerMessage = message.toLowerCase();
  
  // Score each pattern based on keyword matches
  const scores: { [key: string]: { score: number, answer: string } } = {};
  
  for (const [category, pattern] of Object.entries(lang.patterns)) {
    let score = 0;
    const matchedKeywords: string[] = [];
    
    for (const keyword of pattern.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }
    
    if (score > 0) {
      scores[category] = { score, answer: pattern.answer };
      console.log(`Pattern ${category} scored ${score} with keywords: ${matchedKeywords.join(', ')}`);
    }
  }
  
  // Return the pattern with the highest score
  if (Object.keys(scores).length > 0) {
    const bestMatch = Object.entries(scores).reduce((a, b) => 
      a[1].score > b[1].score ? a : b
    );
    console.log(`Best match: ${bestMatch[0]} with score ${bestMatch[1].score}`);
    return bestMatch[1].answer;
  }
  
  return lang.fallback;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, conversation_history, customer_email, customer_name, conversation_id } = await req.json();
    
    console.log('FAQ Bot received message:', message, 'Language:', language);

    let conversationId = conversation_id;
    
    // Create or get conversation
    if (!conversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          customer_email: customer_email || null,
          customer_name: customer_name || null,
          language: language || 'en'
        })
        .select()
        .single();
      
      if (convError) {
        console.error('Error creating conversation:', convError);
        throw new Error('Failed to create conversation');
      }
      
      conversationId = conversation.id;
    }

    // Store customer message
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'customer',
      sender_name: customer_name || 'Customer',
      message: message,
      language: language || 'en'
    });

    // Get FAQ response
    const botResponse = findBestMatch(message, language || 'en');
    
    console.log('FAQ Bot response:', botResponse);

    // Store bot response
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'bot',
      sender_name: 'MT Support',
      message: botResponse,
      language: language || 'en'
    });

    return new Response(JSON.stringify({ 
      response: botResponse,
      conversation_id: conversationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in FAQ chatbot function:', error);
    
    // Fallback responses based on language
    const fallbackResponses = {
      'en': "I apologize, but I'm experiencing technical difficulties. Please contact our support team at info@mtkcx.com or try again later.",
      'ar': "أعتذر، ولكنني أواجه صعوبات تقنية. يرجى الاتصال بفريق الدعم على info@mtkcx.com أو المحاولة مرة أخرى لاحقاً.",
      'he': "אני מתנצל, אבל אני חווה קשיים טכניים. אנא צור קשר עם צוות התמיכה שלנו בכתובת info@mtkcx.com או נסה שוב מאוחר יותר."
    };

    const { language } = await req.json().catch(() => ({ language: 'en' }));
    
    return new Response(JSON.stringify({ 
      response: fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});