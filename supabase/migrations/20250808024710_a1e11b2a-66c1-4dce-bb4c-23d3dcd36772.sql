-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Email templates are viewable by everyone" 
ON public.email_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system email templates
INSERT INTO public.email_templates (name, subject, content, template_type, description, is_system, variables) VALUES
(
  'Welcome Email',
  'Welcome to Our Newsletter! 🎉',
  '<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome {{name}}!</h1>
      <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for joining our community</p>
    </div>
    <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
      <h2 style="color: #333; margin-top: 0;">What to Expect</h2>
      <div style="margin: 30px 0;">
        <h3 style="color: #667eea; margin-bottom: 10px;">🚀 Exclusive Offers</h3>
        <p>Be the first to know about special promotions and exclusive deals available only to our subscribers.</p>
      </div>
      <div style="margin: 30px 0;">
        <h3 style="color: #667eea; margin-bottom: 10px;">📦 New Product Updates</h3>
        <p>Get notified when we launch new products and services that could benefit your business.</p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <h3 style="color: #333; margin-top: 0;">Welcome to Our Community!</h3>
        <p style="margin: 15px 0;">Discover our professional car care products and services</p>
        <a href="{{shop_url}}/products" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Shop Now</a>
      </div>
    </div>
  </div>',
  'welcome',
  'Sent automatically when users subscribe to newsletter',
  true,
  '{"name": "Customer Name", "shop_url": "Store URL"}'
),
(
  'Order Confirmation',
  'Order Confirmed - Thank You! ✅',
  '<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✅</h1>
      <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your order {{customer_name}}</p>
    </div>
    <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
        <p><strong>Order Number:</strong> {{order_number}}</p>
        <p><strong>Total Amount:</strong> {{total_amount}}</p>
        <p><strong>Payment Method:</strong> {{payment_method}}</p>
      </div>
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #0ea5e9; margin-top: 0;">What''s Next?</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>We''ll prepare your order and send you tracking information</li>
          <li>Expected delivery: 3-5 business days</li>
        </ul>
      </div>
    </div>
  </div>',
  'order_confirmation',
  'Sent automatically when orders are placed',
  true,
  '{"customer_name": "Customer Name", "order_number": "Order Number", "total_amount": "Total Amount", "payment_method": "Payment Method"}'
),
(
  'Promotional Template',
  'Special Offer Just for You! 🎉',
  '<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">{{campaign_name}}</h1>
      <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Exclusive offer for our valued customers</p>
    </div>
    <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
      <h2 style="color: #333; margin-top: 0;">Hello {{customer_name}}!</h2>
      <div style="margin: 30px 0;">
        {{campaign_content}}
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #334155; margin-top: 0;">Why Choose Us?</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #64748b;">
          <li>High-quality products with competitive prices</li>
          <li>Fast and reliable delivery across Israel</li>
          <li>Professional customer service</li>
          <li>30-day return policy</li>
        </ul>
      </div>
    </div>
  </div>',
  'promotional',
  'Custom marketing campaigns',
  false,
  '{"customer_name": "Customer Name", "campaign_name": "Campaign Name", "campaign_content": "Campaign Content"}'
);