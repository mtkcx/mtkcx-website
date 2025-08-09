-- Update Arabic and Hebrew translations for the 3 main categories
UPDATE categories 
SET 
  name_ar = 'تنظيف الداخل',
  name_he = 'ניקוי פנים'
WHERE slug = 'interior-cleaning';

UPDATE categories 
SET 
  name_ar = 'تنظيف الخارج', 
  name_he = 'ניקוי חיצוני'
WHERE slug = 'exterior-cleaning';

UPDATE categories 
SET 
  name_ar = 'التلميع والطلاء',
  name_he = 'ליטוש וציפויים' 
WHERE slug = 'polishing-coatings';