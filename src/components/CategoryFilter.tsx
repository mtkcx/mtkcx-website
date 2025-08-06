import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
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
  const { t } = useLanguage();
  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t('categories.categories')}</h3>
      <ScrollArea className="h-96">
        <div className="space-y-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className="w-full justify-between text-left h-auto py-2 px-3"
            onClick={() => onCategorySelect(null)}
          >
            <span className="truncate">{t('categories.all_products')}</span>
            {productCounts.total !== undefined && (
              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                {productCounts.total}
              </Badge>
            )}
          </Button>
          
          {sortedCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "ghost"}
              className="w-full justify-between text-left h-auto py-2 px-3"
              onClick={() => onCategorySelect(category.slug)}
            >
              <span className="truncate pr-2">{category.name}</span>
              <Badge variant="secondary" className="ml-2 flex-shrink-0">
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