-- Ensure email uniqueness at database level
-- First, let's check and clean up any duplicate emails in auth.users (if any exist)

-- Add a unique constraint on email in the auth schema if it doesn't exist
-- Note: This constraint should already exist in Supabase, but we'll ensure it

-- Create a function to prevent duplicate email signups
CREATE OR REPLACE FUNCTION auth.prevent_duplicate_email_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email already exists
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = NEW.email 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'An account with this email already exists'
      USING HINT = 'Please use a different email address or sign in to your existing account';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent duplicate emails during signup
DROP TRIGGER IF EXISTS prevent_duplicate_email_trigger ON auth.users;
CREATE TRIGGER prevent_duplicate_email_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.prevent_duplicate_email_signup();