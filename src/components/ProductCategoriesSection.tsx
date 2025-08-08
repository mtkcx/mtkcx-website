import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import interiorCleaningImage from '/lovable-uploads/3df6143b-1e24-4063-ac21-1f8d68e1c558.png';
import exteriorCleaningImage from '/lovable-uploads/5888e030-a950-4019-a5ea-9d9287fbdcc7.png';
import polishingCoatingsImage from '/lovable-uploads/baa55ddc-7737-4bef-b3ae-c2f59f4cf3d9.png';
const ProductCategoriesSection = () => {
  const navigate = useNavigate();
  const {
    t,
    isRTL
  } = useLanguage();
  const categories = [{
    name: t('categories.interior_cleaning'),
    slug: 'interior-cleaning',
    image: interiorCleaningImage
  }, {
    name: t('categories.exterior_cleaning'),
    slug: 'exterior-cleaning',
    image: exteriorCleaningImage
  }, {
    name: t('categories.polishing_coatings'),
    slug: 'polishing-coatings',
    image: polishingCoatingsImage
  }];
  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
    window.scrollTo(0, 0);
  };
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-6 md:text-5xl">
            {t('categories.shop_by_category')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('categories.shop_by_category_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {categories.map((category, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-background" onClick={() => handleCategoryClick(category.slug)}>
              <CardContent className="p-8 text-center px-0">
                <div className="mb-6 relative">
                  <div className="w-48 h-48 mx-auto rounded-full bg-muted/50 border-4 border-primary/10 group-hover:border-primary/30 transition-colors overflow-hidden relative">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
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