import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ResponsiveImage from './ResponsiveImage';
import LazyLoad from './LazyLoad';

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

interface OptimizedProductGridProps {
  products: Product[];
  loading?: boolean;
  itemsPerPage?: number;
}

const ProductCard = memo(({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  const getLocalizedName = () => {
    if (currentLanguage === 'ar' && product.name_ar) return product.name_ar;
    if (currentLanguage === 'he' && product.name_he) return product.name_he;
    return product.name;
  };

  const getLocalizedDescription = () => {
    if (currentLanguage === 'ar' && product.description_ar) return product.description_ar;
    if (currentLanguage === 'he' && product.description_he) return product.description_he;
    return product.description;
  };

  const getLocalizedCategoryName = () => {
    if (currentLanguage === 'ar' && product.category.name_ar) return product.category.name_ar;
    if (currentLanguage === 'he' && product.category.name_he) return product.category.name_he;
    return product.category.name;
  };

  const { minPrice, maxPrice } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { minPrice: 0, maxPrice: 0 };
    }
    const prices = product.variants.map(v => v.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  }, [product.variants]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  const formatPriceRange = () => {
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  return (
    <LazyLoad height="400px" className="h-full">
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20 will-change-transform hover:scale-105 h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden">
          <ResponsiveImage
            src={product.image_url}
            alt={getLocalizedName()}
            className="w-full h-full"
            aspectRatio="square"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {getLocalizedCategoryName()}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        <CardContent className="p-3 sm:p-4 flex-1">
          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">
            {getLocalizedName()}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
            {getLocalizedDescription()}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {t('products.code')}: {product.product_code}
          </p>
          <div className="text-lg sm:text-xl font-bold text-primary">
            {formatPriceRange()}
          </div>
        </CardContent>

        <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              navigate(`/product/${product.id}`);
              window.scrollTo(0, 0);
            }}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">{t('products.view_details')}</span>
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              navigate(`/product/${product.id}`);
              window.scrollTo(0, 0);
            }}
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">{t('products.add_to_cart')}</span>
          </Button>
        </CardFooter>
      </Card>
    </LazyLoad>
  );
});

ProductCard.displayName = 'ProductCard';

const OptimizedProductGrid: React.FC<OptimizedProductGridProps> = ({
  products,
  loading = false,
  itemsPerPage = 12
}) => {
  const displayedProducts = useMemo(() => {
    return products.slice(0, itemsPerPage);
  }, [products, itemsPerPage]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <Card key={index} className="animate-pulse h-[400px]">
            <div className="aspect-square bg-muted rounded-t-lg" />
            <CardContent className="p-3 sm:p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded mb-4" />
              <div className="h-6 bg-muted rounded" />
            </CardContent>
            <CardFooter className="p-3 sm:p-4 pt-0">
              <div className="h-9 bg-muted rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {displayedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default memo(OptimizedProductGrid);