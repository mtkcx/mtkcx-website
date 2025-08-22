-- Remove the previous trigger and function that might be interfering
DROP TRIGGER IF EXISTS prevent_duplicate_email_trigger ON auth.users;
DROP FUNCTION IF EXISTS auth.prevent_duplicate_email_signup();

-- Update Supabase configuration to properly handle duplicate emails
-- This will be handled by updating the config.toml file to disable repeated signups