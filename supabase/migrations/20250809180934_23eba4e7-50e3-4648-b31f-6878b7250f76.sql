-- Fix function search path security warning
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
  DELETE FROM public.rate_limits 
  WHERE reset_at < now() - interval '1 day';
  
  -- Get current attempt count in the window
  SELECT COALESCE(attempt_count, 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND first_attempt_at >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.rate_limits (identifier, action_type, attempt_count, first_attempt_at, last_attempt_at, reset_at)
  VALUES (p_identifier, p_action_type, 1, now(), now(), now() + (p_window_minutes || ' minutes')::interval)
  ON CONFLICT (identifier, action_type)
  DO UPDATE SET
    attempt_count = CASE 
      WHEN public.rate_limits.first_attempt_at < window_start THEN 1
      ELSE public.rate_limits.attempt_count + 1
    END,
    first_attempt_at = CASE
      WHEN public.rate_limits.first_attempt_at < window_start THEN now()
      ELSE public.rate_limits.first_attempt_at
    END,
    last_attempt_at = now(),
    reset_at = CASE
      WHEN public.rate_limits.first_attempt_at < window_start THEN now() + (p_window_minutes || ' minutes')::interval
      ELSE public.rate_limits.reset_at
    END;
  
  RETURN TRUE;
END;
$function$;