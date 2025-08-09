-- Security Fix: Implement proper Row Level Security policies

-- 1. Fix Newsletter Subscriptions - Remove public access, add proper restrictions
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Subscribers can view their own subscription" ON public.newsletter_subscriptions;

-- Only allow newsletter creation and admin access
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (is_admin());

-- 2. Fix Email Logs - Remove public access, add user-specific access
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;

-- Only allow users to see their own email logs and admins to see all
CREATE POLICY "Users can view their own email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.email() = email OR is_admin());

-- Admins can insert email logs (for system operations)
CREATE POLICY "Admins can insert email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (is_admin());

-- 3. Fix Email Templates - Remove public access, admin-only
DROP POLICY IF EXISTS "Email templates are viewable by everyone" ON public.email_templates;
DROP POLICY IF EXISTS "Only admins can manage email templates" ON public.email_templates;

-- Only admins can access email templates
CREATE POLICY "Only admins can access email templates" 
ON public.email_templates 
FOR ALL 
USING (is_admin());

-- 4. Fix Email Campaigns - Change from any authenticated user to admin-only
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.email_campaigns;

CREATE POLICY "Only admins can manage campaigns" 
ON public.email_campaigns 
FOR ALL 
USING (is_admin());

-- 5. Add policy for order access to email logs relationship
CREATE POLICY "Users can view email logs for their orders" 
ON public.email_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = email_logs.order_id 
    AND (
      (orders.user_id IS NOT NULL AND auth.uid() = orders.user_id) 
      OR (orders.user_id IS NULL AND orders.email = auth.email())
    )
  )
  OR is_admin()
);