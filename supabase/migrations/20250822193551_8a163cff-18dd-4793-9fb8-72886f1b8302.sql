-- Add status constraint to orders table if it doesn't exist
DO $$
BEGIN
    -- Check if constraint exists and drop it if it does
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_status_check' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_status_check;
    END IF;
    
    -- Add new status constraint
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
END $$;