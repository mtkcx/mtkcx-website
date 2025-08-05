-- Fix security issues detected by the linter

-- Update the update_orders_updated_at function to set search_path
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;