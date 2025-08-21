-- Add city column to enrollment_requests table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollment_requests' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.enrollment_requests ADD COLUMN city TEXT;
    END IF;
END $$;