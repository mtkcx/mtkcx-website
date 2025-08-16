import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  slug: string;
  display_order?: number;
}

const CategoryDropdown = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback categories
  const fallbackCategories = [
    {
      id: 'interior-cleaning',
      name: t('categories.interior_cleaning'),
      slug: 'interior-cleaning',
      display_order: 1
    },
    {
      id: 'exterior-cleaning', 
      name: t('categories.exterior_cleaning'),
      slug: 'exterior-cleaning',
      display_order: 2
    },
    {
      id: 'polishing-coatings',
      name: t('categories.polishing_coatings'),
      slug: 'polishing-coatings',
      display_order: 3
    }
  ];

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
          // Filter to only show the 3 main categories
          const allowedSlugs = ['interior-cleaning', 'exterior-cleaning', 'polishing-coatings'];
          const filteredCategories = dbCategories.filter(cat => allowedSlugs.includes(cat.slug));
          setCategories(filteredCategories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
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

  const handleViewAllProducts = () => {
    navigate('/products');
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <ChevronDown className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-colors">
          <ChevronDown className="h-4 w-4 mr-2" />
          {t('categories.shop_by_category')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56 bg-background/95 backdrop-blur-sm border-primary/20">
        <DropdownMenuItem onClick={handleViewAllProducts} className="cursor-pointer hover:bg-primary/10">
          <span className="font-medium">{t('mobile.products.all_categories')}</span>
        </DropdownMenuItem>
        {categories.map((category) => {
          const categoryName = currentLanguage === 'ar' ? (category.name_ar || category.name) :
                              currentLanguage === 'he' ? (category.name_he || category.name) :
                              category.name;
          return (
            <DropdownMenuItem 
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="cursor-pointer hover:bg-primary/10"
            >
              <span>{categoryName}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryDropdown;