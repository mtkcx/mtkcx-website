import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
const ProductCategoriesSection = () => {
  const navigate = useNavigate();
  const {
    t,
    isRTL
  } = useLanguage();
  const categories = [{
    name: t('categories.interior_cleaning'),
    slug: 'interior-cleaning',
    placeholder: '/api/placeholder/300/300'
  }, {
    name: t('categories.exterior_cleaning'),
    slug: 'exterior-cleaning',
    placeholder: '/api/placeholder/300/300'
  }, {
    name: t('categories.self_cleaning'),
    slug: 'self-cleaning',
    placeholder: '/api/placeholder/300/300'
  }];
  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
  };
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-6 md:text-5xl">
            {t('categories.shop_by_category')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('categories.shop_by_category_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {categories.map((category, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-background" onClick={() => handleCategoryClick(category.slug)}>
              <CardContent className="p-8 text-center px-[12px]">
                <div className="mb-6 relative">
                  <div className="w-48 h-48 mx-auto rounded-full bg-muted/50 border-4 border-primary/10 group-hover:border-primary/30 transition-colors overflow-hidden relative">
                    {/* Placeholder for image upload */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                      <Camera className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                    </div>
                    {/* Upload indicator */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-primary/90 transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-muted-foreground text-sm">
                  {t('categories.click_to_browse')}
                </p>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default ProductCategoriesSection;