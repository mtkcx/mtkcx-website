-- Clean up old campaigns with discount codes
DELETE FROM email_campaigns 
WHERE discount_code IS NOT NULL 
   OR discount_percentage IS NOT NULL 
   OR name IN ('Welcome Offer Campaign', 'Seasonal Sale');

-- Remove discount-related columns from email_campaigns table since we no longer use them
ALTER TABLE email_campaigns DROP COLUMN IF EXISTS discount_code;
ALTER TABLE email_campaigns DROP COLUMN IF EXISTS discount_percentage;