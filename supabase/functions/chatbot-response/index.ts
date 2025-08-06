import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const businessContext = `
You are a customer service assistant for a professional business. Here's what you need to know:

BUSINESS INFO:
- We sell high-quality products with various size options and competitive prices
- We offer professional services and custom solutions
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
- Support via chat, email, and phone
- 30-day return policy
- 1-year warranty on all products

LANGUAGE SUPPORT:
- Respond in the same language the customer uses
- Support Hebrew, Arabic, and English
- Be professional and helpful in all languages

Keep responses concise, helpful, and always try to direct customers toward making a purchase or contacting support for complex issues.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, conversation_history } = await req.json();

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

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chatbot-response function:', error);
    
    // Fallback responses based on language
    const fallbackResponses = {
      'en': "I apologize, but I'm experiencing technical difficulties. Please contact our support team at support@yourcompany.com or try again later.",
      'ar': "أعتذر، ولكنني أواجه صعوبات تقنية. يرجى الاتصال بفريق الدعم على support@yourcompany.com أو المحاولة مرة أخرى لاحقاً.",
      'he': "אני מתנצל, אבל אני חווה קשיים טכניים. אנא צור קשר עם צוות התמיכה שלנו בכתובת support@yourcompany.com או נסה שוב מאוחר יותר."
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