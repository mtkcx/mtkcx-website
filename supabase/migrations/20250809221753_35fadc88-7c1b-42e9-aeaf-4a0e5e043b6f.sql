-- Add function to set configuration for RLS policy context
CREATE OR REPLACE FUNCTION public.set_config(
  setting_name TEXT,
  setting_value TEXT,
  is_local BOOLEAN DEFAULT true
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, is_local);
  RETURN setting_value;
END;
$$;