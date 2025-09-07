-- Fix foreign key constraint to allow proper order deletion
-- Drop the existing foreign key constraint that's preventing order deletion
ALTER TABLE email_logs DROP CONSTRAINT IF EXISTS email_logs_order_id_fkey;

-- Re-create the foreign key with CASCADE deletion
-- This will automatically delete email_logs when an order is deleted
ALTER TABLE email_logs 
ADD CONSTRAINT email_logs_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE CASCADE;