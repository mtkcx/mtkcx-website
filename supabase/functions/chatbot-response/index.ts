import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const businessContext = `
You are a customer service assistant for MT Wraps, a professional car care and vehicle wrapping company. Here's what you need to know:

BUSINESS INFO:
- Official Koch-Chemie distribution partner
- We sell high-quality car care products from Germany's leading manufacturer
- We offer professional detailing training courses and certification programs
- We provide premium vehicle wrapping and customization services through MT Wraps
- We serve customers in Israel and internationally
- Currency is Israeli Shekel (₪)
- We accept multiple payment methods including Stripe and PayPal

SHIPPING & DELIVERY:
- Standard delivery: 3-5 business days within Israel
- Express delivery: 1-2 business days (additional cost)
- International shipping available (5-10 business days)
- Free shipping on orders over ₪200

CUSTOMER SERVICE:
- Business hours: Sunday-Thursday 9:00-18:00, Friday 9:00-14:00
- Support via chat, email (info@mtkcx.com), and phone
- 30-day return policy on products
- 1-year warranty on all products
- Professional wrapping services with quality guarantee

SERVICES:
- Koch-Chemie car care products (pre-wash, detailing, polishing, finishing)
- Professional detailing and polishing certification courses
- MT Wraps vehicle wrapping and customization services
- Paint protection film (PPF) installation
- Color change wrapping
- Commercial fleet solutions
- Technical support and consultation

LANGUAGE SUPPORT:
- Respond in the same language the customer uses
- Support Hebrew, Arabic, and English
- Be professional and helpful in all languages
- Use appropriate cultural context for each language

Always try to direct customers toward making a purchase, enrolling in courses, or contacting support for complex issues. For support contact, always use info@mtkcx.com.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, conversation_history, customer_email, customer_name, conversation_id } = await req.json();

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

    // Build conversation context
    let conversationContext = businessContext;
    
    if (conversation_history && conversation_history.length > 0) {
      conversationContext += "\n\nPREVIOUS CONVERSATION:\n";
      conversation_history.forEach((msg: any) => {
        conversationContext += `${msg.isBot ? 'Assistant' : 'Customer'}: ${msg.text}\n`;
      });
    }

    // Language-specific instructions
    const languageInstructions = {
      'ar': 'Respond in Arabic. Be respectful and professional.',
      'he': 'Respond in Hebrew. Be respectful and professional.',
      'en': 'Respond in English. Be respectful and professional.'
    };

    const systemPrompt = conversationContext + "\n\n" + (languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en);

    console.log('Making OpenAI API call...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data:', JSON.stringify(data, null, 2));
    
    // Check if response is valid
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid API response structure');
    }
    
    const botResponse = data.choices[0].message.content;

    // Store bot response
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'bot',
      sender_name: 'MT Wraps Assistant',
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
    console.error('Error in chatbot-response function:', error);
    
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