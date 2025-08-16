import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import interiorCleaningImage from '/lovable-uploads/3df6143b-1e24-4063-ac21-1f8d68e1c558.png';
import exteriorCleaningImage from '/lovable-uploads/5888e030-a950-4019-a5ea-9d9287fbdcc7.png';
import polishingCoatingsImage from '/lovable-uploads/baa55ddc-7737-4bef-b3ae-c2f59f4cf3d9.png';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  slug: string;
  display_order?: number;
  image?: string;
}
const ProductCategoriesSection = () => {
  const navigate = useNavigate();
  const { t, isRTL, currentLanguage } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback categories with images
  const fallbackCategories = [{
    id: 'interior-cleaning',
    name: t('categories.interior_cleaning'),
    slug: 'interior-cleaning',
    image: interiorCleaningImage,
    display_order: 1
  }, {
    id: 'exterior-cleaning',
    name: t('categories.exterior_cleaning'),
    slug: 'exterior-cleaning',
    image: exteriorCleaningImage,
    display_order: 2
  }, {
    id: 'polishing-coatings',
    name: t('categories.polishing_coatings'),
    slug: 'polishing-coatings',
    image: polishingCoatingsImage,
    display_order: 3
  }];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data: dbCategories, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order');

        if (error) throw error;

        if (dbCategories && dbCategories.length > 0) {
          // Filter database categories to only show the 3 specific ones
          const allowedSlugs = ['interior-cleaning', 'exterior-cleaning', 'polishing-coatings'];
          const filteredCategories = dbCategories.filter(cat => allowedSlugs.includes(cat.slug));
          
          // Map filtered categories with fallback images
          const categoriesWithImages = filteredCategories.map(cat => {
            const fallback = fallbackCategories.find(f => f.slug === cat.slug);
            return {
              ...cat,
              image: fallback?.image || '/placeholder.svg'
            };
          });
          setCategories(categoriesWithImages);
        } else {
          // Use fallback categories if no database categories
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use fallback categories on error
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t]);
  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
    window.scrollTo(0, 0);
  };
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-6 md:text-5xl">
            {t('categories.shop_by_category')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('categories.shop_by_category_subtitle')}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative">
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  handleCategoryClick(e.target.value);
                }
              }}
              className="w-full p-4 text-lg font-semibold bg-background border-2 border-primary/20 rounded-lg cursor-pointer hover:border-primary/40 focus:border-primary focus:outline-none transition-colors appearance-none"
              defaultValue=""
            >
              <option value="" disabled>
                {loading ? 'Loading categories...' : t('categories.select_category')}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {currentLanguage === 'ar' ? (category.name_ar || category.name) :
                   currentLanguage === 'he' ? (category.name_he || category.name) :
                   category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ProductCategoriesSection;