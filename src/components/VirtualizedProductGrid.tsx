import React, { useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVirtualScrolling } from '@/hooks/useVirtualScrolling';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import ResponsiveImage from '@/components/ResponsiveImage';
import LazyLoad from '@/components/LazyLoad';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  category: {
    name: string;
    name_en?: string;
  };
  image_url?: string;
  product_code?: string;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    image_url?: string;
  }>;
}

interface VirtualizedProductGridProps {
  products: Product[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ProductCard = React.memo(({ 
  product, 
  style 
}: { 
  product: Product; 
  style: React.CSSProperties;
}) => {
  const { currentLanguage } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { preloadNextPage } = useImagePreloader();

  const getLocalizedContent = (field: string, fieldEn?: string) => {
    return currentLanguage === 'en' && fieldEn ? fieldEn : field;
  };

  const lowestPrice = useMemo(() => {
    if (!product.variants?.length) return 0;
    return Math.min(...product.variants.map(v => v.price));
  }, [product.variants]);

  const primaryVariant = product.variants?.[0];
  const imageUrl = primaryVariant?.image_url || product.image_url;

  const handleAddToCart = () => {
    if (!primaryVariant) {
      toast.error('No variant available');
      return;
    }
    
    addToCart({
      productId: product.id,
      productName: product.name,
      productCode: product.product_code || '',
      variantId: primaryVariant.id,
      variantSize: primaryVariant.name,
      price: primaryVariant.price,
      imageUrl: imageUrl || '',
      categoryName: product.category.name
    });
    
    toast.success('Added to cart');
  };

  const handleViewDetails = () => {
    // Preload next few product images
    const nextImages = product.variants
      ?.slice(0, 3)
      .map(v => v.image_url)
      .filter(Boolean) as string[];
    
    if (nextImages.length > 0) {
      preloadNextPage(nextImages);
    }
    
    navigate(`/product/${product.id}`);
  };

  return (
    <div style={style} className="p-2">
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <LazyLoad height={200} className="relative">
            <div className="relative aspect-square overflow-hidden">
              {imageUrl && (
                <ResponsiveImage
                  src={imageUrl}
                  alt={getLocalizedContent(product.name, product.name_en)}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  aspectRatio="square"
                  loading="lazy"
                  priority={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </LazyLoad>
          
          <div className="p-4 space-y-3">
            {product.product_code && (
              <div className="text-xs text-muted-foreground font-mono">
                {product.product_code}
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {getLocalizedContent(product.name, product.name_en)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {getLocalizedContent(product.category.name, product.category.name_en)}
              </p>
            </div>
            
            <div className="text-lg font-bold text-primary">
              €{lowestPrice.toFixed(2)}
              {product.variants?.length > 1 && (
                <span className="text-xs text-muted-foreground ml-1">+</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="flex-1 text-xs h-8"
              >
                View
              </Button>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="flex-1 text-xs h-8"
                disabled={!primaryVariant}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  loading = false,
  onLoadMore,
  hasMore = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { batchPreload } = useImagePreloader();
  
  const {
    visibleItems,
    totalHeight,
    shouldLoadMore,
    handleScroll
  } = useVirtualScrolling(products, {
    itemHeight: 320,
    containerHeight: 600,
    overscan: 2,
    threshold: 0.7
  });

  // Preload visible images
  useEffect(() => {
    const imagesToPreload = visibleItems
      .map(({ item }) => {
        const imageUrl = item.variants?.[0]?.image_url || item.image_url;
        return imageUrl ? { src: imageUrl, options: { priority: 'high' as const, quality: 85 } } : null;
      })
      .filter(Boolean) as Array<{ src: string; options: any }>;

    if (imagesToPreload.length > 0) {
      batchPreload(imagesToPreload);
    }
  }, [visibleItems, batchPreload]);

  // Load more when needed
  useEffect(() => {
    if (shouldLoadMore && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  }, [shouldLoadMore, hasMore, onLoadMore, loading]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto"
      style={{ 
        height: '600px',
        contain: 'strict',
        willChange: 'scroll-position'
      }}
    >
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        style={{ height: totalHeight }}
      >
        {visibleItems.map(({ item, index, top }) => (
          <ProductCard
            key={`${item.id}-${index}`}
            product={item}
            style={{
              position: 'absolute',
              top,
              width: '100%',
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </div>
      
      {loading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedProductGrid;