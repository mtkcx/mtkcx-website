-- Fix the payment gateway check constraint to match the frontend values
-- First, let's see what the current constraint allows
DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_payment_gateway_check' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_payment_gateway_check;
    END IF;
    
    -- Add new constraint that matches the frontend values
    ALTER TABLE orders ADD CONSTRAINT orders_payment_gateway_check 
    CHECK (payment_gateway IN ('cash_on_delivery', 'credit_card', 'stripe', 'paypal'));
END $$;