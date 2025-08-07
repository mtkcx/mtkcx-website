import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  slug: string;
  display_order: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categorySlug: string | null) => void;
  productCounts?: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  productCounts = {}
}) => {
  const { t, currentLanguage } = useLanguage();
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t('categories.categories')}</h3>
      <ScrollArea className="h-96">
        <div className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className="w-full justify-between text-left h-auto py-3 px-4"
            onClick={() => onCategorySelect(null)}
          >
            <span className="truncate flex-1">{t('categories.all_products')}</span>
            {productCounts.total !== undefined && (
              <Badge variant="secondary" className="ml-3 flex-shrink-0 min-w-[2rem] h-6 flex items-center justify-center">
                {productCounts.total}
              </Badge>
            )}
          </Button>
          
          {sortedCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "ghost"}
              className="w-full justify-between text-left h-auto py-3 px-4"
              onClick={() => onCategorySelect(category.slug)}
            >
              <span className="truncate flex-1 pr-2">
                {currentLanguage === 'ar' ? (category.name_ar || category.name) :
                 currentLanguage === 'he' ? (category.name_he || category.name) :
                 category.name}
              </span>
              <Badge variant="secondary" className="ml-3 flex-shrink-0 min-w-[2rem] h-6 flex items-center justify-center">
                {productCounts[category.slug] || 0}
              </Badge>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;