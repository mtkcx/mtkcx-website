
import React, { memo, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ResponsiveImage from './ResponsiveImage';
import { Skeleton } from '@/components/ui/skeleton';

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
  }>;
}

interface FastProductGridProps {
  products: Product[];
  loading?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Optimized product card with minimal re-renders
const ProductCard = memo(({ product, index }: { product: Product; index: number }) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const localizedContent = useMemo(() => ({
    name: currentLanguage === 'ar' && product.name_ar ? product.name_ar :
          currentLanguage === 'he' && product.name_he ? product.name_he :
          product.name,
    description: currentLanguage === 'ar' && product.description_ar ? product.description_ar :
                 currentLanguage === 'he' && product.description_he ? product.description_he :
                 product.description,
    categoryName: currentLanguage === 'ar' && product.category.name_ar ? product.category.name_ar :
                  currentLanguage === 'he' && product.category.name_he ? product.category.name_he :
                  product.category.name
  }), [product, currentLanguage]);

  const priceInfo = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { minPrice: 0, maxPrice: 0, priceText: 'N/A' };
    }
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const formatter = new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    });
    
    const priceText = minPrice === maxPrice ? 
      formatter.format(minPrice) : 
      `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
      
    return { minPrice, maxPrice, priceText };
  }, [product.variants]);

  const handleNavigation = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  }, [navigate, product.id]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden border hover:border-primary/20 will-change-transform hover:scale-[1.02] h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <ResponsiveImage
          src={product.image_url}
          alt={localizedContent.name}
          className={`w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          aspectRatio="square"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={index < 6}
          loading={index < 6 ? 'eager' : 'lazy'}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {localizedContent.categoryName}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 leading-tight">
          {localizedContent.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {localizedContent.description}
        </p>
        <p className="text-xs text-muted-foreground mb-auto">
          {t('products.code')}: {product.product_code}
        </p>
        <div className="text-lg font-bold text-primary mt-2">
          {priceInfo.priceText}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={handleNavigation}
        >
          <Eye className="w-3 h-3 mr-1" />
          {t('products.view_details')}
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={handleNavigation}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {t('products.add_to_cart')}
        </Button>
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

// Loading skeleton component
const ProductSkeleton = memo(() => (
  <Card className="h-full flex flex-col">
    <Skeleton className="aspect-square" />
    <CardContent className="p-3 flex-1">
      <Skeleton className="h-4 mb-2" />
      <Skeleton className="h-3 mb-2 w-3/4" />
      <Skeleton className="h-3 mb-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </CardContent>
    <CardFooter className="p-3 pt-0">
      <Skeleton className="h-8 w-full" />
    </CardFooter>
  </Card>
));

ProductSkeleton.displayName = 'ProductSkeleton';

const FastProductGrid: React.FC<FastProductGridProps> = ({
  products,
  loading = false,
  loadingMore = false,
  onLoadMore,
  hasMore = false
}) => {
  // Memoize grid layout to prevent unnecessary recalculations
  const gridClassName = useMemo(() => 
    "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6",
    []
  );

  if (loading && products.length === 0) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={gridClassName}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      
      {/* Load more section */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          {loadingMore ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          ) : (
            <Button onClick={onLoadMore} variant="outline" size="lg">
              Load More Products
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(FastProductGrid);
