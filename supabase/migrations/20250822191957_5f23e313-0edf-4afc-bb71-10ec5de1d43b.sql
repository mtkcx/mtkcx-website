-- Ensure the set_config function exists and works properly for order creation
CREATE OR REPLACE FUNCTION public.set_order_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  PERFORM set_config('app.order_context', 'secure_order_creation', true);
  PERFORM set_config('app.security_validated', 'true', true);
END;
$function$;