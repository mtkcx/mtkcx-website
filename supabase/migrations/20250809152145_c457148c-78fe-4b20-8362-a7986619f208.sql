-- Create audit log table for security monitoring
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.is_admin());

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create enhanced rate limiting table
CREATE TABLE public.api_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ip_address, endpoint, window_start)
);

-- Enable RLS on API rate limits (admin only)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view API rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (public.is_admin());

-- Function to check API rate limits
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(MINUTE FROM now())::INTEGER / p_window_minutes) * (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current count for this IP and endpoint in the current window
  SELECT COALESCE(request_count, 0) INTO current_count
  FROM public.api_rate_limits
  WHERE ip_address = inet_client_addr()
    AND endpoint = p_endpoint
    AND window_start = window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (inet_client_addr(), p_endpoint, 1, window_start)
  ON CONFLICT (ip_address, endpoint, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_api_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.api_rate_limits 
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;

-- Add audit triggers for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();