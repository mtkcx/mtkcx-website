import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ResponsiveImage from '@/components/ResponsiveImage';
import LazyLoad from '@/components/LazyLoad';

interface Product {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  description: string;
  description_ar?: string;
  description_he?: string;
  product_code: string;
  image_url: string;
  category: {
    name: string;
    name_ar?: string;
    name_he?: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    size: string;
    price: number;
    is_primary?: boolean;
  }>;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

// Memoized product card component to prevent unnecessary re-renders
const ProductCard = memo<{ product: Product; index: number }>(({ product, index }) => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  // Memoized localized content to prevent re-computation on language changes
  const localizedContent = useMemo(() => {
    const name = currentLanguage === 'ar' 
      ? (product.name_ar || product.name)
      : currentLanguage === 'he' 
      ? (product.name_he || product.name)
      : product.name;

    const description = currentLanguage === 'ar' 
      ? (product.description_ar || product.description)
      : currentLanguage === 'he' 
      ? (product.description_he || product.description)
      : product.description;

    const categoryName = currentLanguage === 'ar' 
      ? (product.category.name_ar || product.category.name)
      : currentLanguage === 'he' 
      ? (product.category.name_he || product.category.name)
      : product.category.name;

    return { name, description, categoryName };
  }, [product, currentLanguage]);

  // Memoized price calculation
  const lowestPrice = useMemo(() => {
    const prices = product.variants.filter(v => v.price > 0).map(v => v.price);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [product.variants]);

  // Memoized short description
  const shortDescription = useMemo(() => {
    if (!localizedContent.description) return '';
    const firstLine = localizedContent.description.split('\n')[0];
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
  }, [localizedContent.description]);

  const handleViewProduct = useCallback(() => {
    navigate(`/products/${product.id}`);
    // Ensure page loads at the top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate, product.id]);

  return (
    <LazyLoad height={350} className="h-full">
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col will-change-transform">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ResponsiveImage
            src={product.image_url || '/placeholder.svg'}
            alt={localizedContent.name}
            aspectRatio="auto"
            priority={index < 4} // Prioritize first 4 images
            preload={index < 2} // Preload first 2 images
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-primary text-xs">
              {product.product_code}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90 text-xs">
              {localizedContent.categoryName}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {localizedContent.name}
          </h3>
          <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1">
            {shortDescription}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {product.variants.length} sizes
            </div>
            {lowestPrice && (
              <div className="text-sm font-bold text-primary">
                ₪{lowestPrice}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleViewProduct}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleViewProduct}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Select Size
          </Button>
        </CardFooter>
      </Card>
    </LazyLoad>
  );
});

ProductCard.displayName = 'ProductCard';

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading }) => {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-[4/3] bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded mb-4" />
              <div className="h-6 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          index={index} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;