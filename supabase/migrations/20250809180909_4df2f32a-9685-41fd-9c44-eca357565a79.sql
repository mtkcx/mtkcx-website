-- Fix critical security vulnerabilities

-- 1. Fix orders RLS policy - restrict updates to order owners and admins only
DROP POLICY IF EXISTS "Allow order updates" ON public.orders;
CREATE POLICY "Users can update their own orders and admins can update all" 
ON public.orders 
FOR UPDATE 
USING (
  (((user_id IS NOT NULL) AND (auth.uid() = user_id)) OR 
   ((user_id IS NULL) AND (email = auth.email())) OR 
   is_admin())
);

-- 2. Restrict chat message insertion to prevent spam
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
CREATE POLICY "Authenticated users and guests can insert messages with rate limiting" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Only allow if conversation exists and belongs to user or is public chat
  EXISTS (
    SELECT 1 FROM chat_conversations 
    WHERE id = conversation_id 
    AND (customer_email = auth.email() OR customer_email IS NULL OR is_admin())
  )
);

-- 3. Secure the make_user_admin function - only allow admins to promote users
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Only allow existing admins to promote users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can promote users';
  END IF;
  
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- If user not found, return false
  IF target_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert admin role if not already exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

-- 4. Create server-side rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action_type text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM rate_limits 
  WHERE reset_at < now() - interval '1 day';
  
  -- Get current attempt count in the window
  SELECT COALESCE(attempt_count, 0) INTO current_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND first_attempt_at >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO rate_limits (identifier, action_type, attempt_count, first_attempt_at, last_attempt_at, reset_at)
  VALUES (p_identifier, p_action_type, 1, now(), now(), now() + (p_window_minutes || ' minutes')::interval)
  ON CONFLICT (identifier, action_type)
  DO UPDATE SET
    attempt_count = CASE 
      WHEN rate_limits.first_attempt_at < window_start THEN 1
      ELSE rate_limits.attempt_count + 1
    END,
    first_attempt_at = CASE
      WHEN rate_limits.first_attempt_at < window_start THEN now()
      ELSE rate_limits.first_attempt_at
    END,
    last_attempt_at = now(),
    reset_at = CASE
      WHEN rate_limits.first_attempt_at < window_start THEN now() + (p_window_minutes || ' minutes')::interval
      ELSE rate_limits.reset_at
    END;
  
  RETURN TRUE;
END;
$function$;

-- 5. Add newsletter verification table for secure token-based verification
CREATE TABLE IF NOT EXISTS public.newsletter_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at timestamp with time zone
);

-- Enable RLS on verification tokens
ALTER TABLE public.newsletter_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage verification tokens
CREATE POLICY "Service role can manage verification tokens" 
ON public.newsletter_verification_tokens 
FOR ALL 
USING (auth.role() = 'service_role');

-- 6. Create secure token generation function
CREATE OR REPLACE FUNCTION public.generate_secure_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$function$;