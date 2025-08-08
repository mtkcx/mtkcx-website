-- Add tracking_number column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add tracking_date column to store when the tracking was sent
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_date TIMESTAMP WITH TIME ZONE;