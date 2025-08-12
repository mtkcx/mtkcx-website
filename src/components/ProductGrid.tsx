import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

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

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading }) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();

  const getProductImage = (product: Product) => {
    // Try to get primary variant image, or fall back to product image
    if (product.variants && product.variants.length > 0) {
      const primaryVariant = product.variants.find(v => v.is_primary) || product.variants[0];
      // In a full implementation, you'd fetch variant-specific images here
      // For now, fall back to product image
    }
    return product.image_url || '/placeholder.svg';
  };

  const getDisplayPrice = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const primaryVariant = product.variants.find(v => v.is_primary) || product.variants[0];
      return primaryVariant.price;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg" />
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

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
    // Ensure page loads at the top
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const getShortDescription = (description: string) => {
    const firstLine = description.split('\n')[0];
    return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
  };

  const getLowestPrice = (variants: Product['variants']) => {
    const prices = variants.filter(v => v.price > 0).map(v => v.price);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const lowestPrice = getLowestPrice(product.variants);
        
        return (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={product.image_url}
                alt={currentLanguage === 'ar' ? (product.name_ar || product.name) :
                     currentLanguage === 'he' ? (product.name_he || product.name) :
                     product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-white/90 text-primary text-xs">
                  {product.product_code}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="bg-white/90 text-xs">
                  {product.category.name}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-3 flex-1 flex flex-col">
              <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {currentLanguage === 'ar' ? (product.name_ar || product.name) :
                 currentLanguage === 'he' ? (product.name_he || product.name) :
                 product.name}
              </h3>
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1">
                {getShortDescription(
                  currentLanguage === 'ar' ? (product.description_ar || product.description) :
                  currentLanguage === 'he' ? (product.description_he || product.description) :
                  product.description
                )}
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
                onClick={() => handleViewProduct(product.id)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => handleViewProduct(product.id)}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Select Size
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductGrid;