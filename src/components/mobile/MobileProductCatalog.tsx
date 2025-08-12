import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, ShoppingCart, Filter, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MobileProductCatalogProps {
  compact?: boolean;
  onCheckout?: () => void;
}

export const MobileProductCatalog: React.FC<MobileProductCatalogProps> = ({ compact = false, onCheckout }) => {
  const { addToCart: addItemToCart, getTotalItems } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { variantId: string; size: string; price: number }>>({});
  
  // Initialize mobile features hook
  const mobileFeatures = {
    canUseHaptics: () => typeof window !== 'undefined' && 'vibrate' in navigator,
    hapticFeedback: (type: string) => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(type === 'light' ? 10 : 50);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle navigation events from home page and tab switching
  useEffect(() => {
    const handleSetCategory = (event: CustomEvent) => {
      setSelectedCategory(event.detail.category);
    };

    const handleClearFilters = () => {
      setSelectedCategory(null);
      setSearchTerm('');
    };

    window.addEventListener('set-product-category', handleSetCategory as EventListener);
    window.addEventListener('clear-product-filters', handleClearFilters as EventListener);
    
    return () => {
      window.removeEventListener('set-product-category', handleSetCategory as EventListener);
      window.removeEventListener('clear-product-filters', handleClearFilters as EventListener);
    };
  }, []);

  // Optimized data fetching
  const fetchProducts = useCallback(async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          product_code,
          image_url,
          product_categories!product_categories_product_id_fkey (
            categories!product_categories_category_id_fkey (
              id,
              name,
              slug
            )
          ),
          product_variants!product_variants_product_id_fkey (
            id,
            size,
            price
          ),
          product_images!product_images_product_id_fkey (
            id,
            image_url,
            is_primary,
            variant_id
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;

      const categoryMap = new Map();
      const transformedProducts = productsData
        ?.filter(product => product.product_variants?.length > 0)
        .map(product => {
          const productCategories = product.product_categories?.map(pc => pc.categories).filter(Boolean) || [];
          productCategories.forEach(cat => {
            if (cat && !categoryMap.has(cat.slug)) {
              categoryMap.set(cat.slug, { id: cat.id, name: cat.name, slug: cat.slug });
            }
          });

          return {
            ...product,
            product_categories: product.product_categories,
            product_variants: product.product_variants,
            product_images: product.product_images
          };
        }) || [];

      setCategories(Array.from(categoryMap.values()));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        product.product_categories?.some((pc: any) => pc.categories?.slug === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleVariantChange = (productId: string, variantId: string, size: string, price: number) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { variantId, size, price }
    }));
  };

  const getSelectedVariant = (productId: string) => {
    return selectedVariants[productId];
  };

  const getCurrentProductImage = (product: any) => {
    const selectedVariant = getSelectedVariant(product.id);
    
    if (selectedVariant) {
      // Find image for selected variant
      const variantImage = product.product_images?.find((img: any) => 
        img.variant_id === selectedVariant.variantId
      );
      if (variantImage) return variantImage.image_url;
    }
    
    // Fall back to primary image or first image
    const primaryImage = product.product_images?.find((img: any) => img.is_primary);
    if (primaryImage) return primaryImage.image_url;
    
    return product.product_images?.[0]?.image_url || product.image_url;
  };

  const addToCart = (product: any) => {
    const selectedVariant = getSelectedVariant(product.id);
    
    if (!selectedVariant && product.product_variants?.length > 0) {
      toast({
        title: 'Please select a size',
        description: 'Please choose a product size before adding to cart',
        variant: 'destructive'
      });
      return;
    }

    const cartItem = {
      productId: product.id,
      productName: product.name,
      productCode: product.product_code,
      variantId: selectedVariant?.variantId || null,
      variantSize: selectedVariant?.size || 'default',
      price: selectedVariant?.price || parseFloat(product.product_variants?.[0]?.price || '0'),
      quantity: 1,
      imageUrl: getCurrentProductImage(product),
      categoryName: product.product_categories?.[0]?.categories?.name || 'Unknown'
    };

    addItemToCart(cartItem);
    
    // Haptic feedback
    if (mobileFeatures.canUseHaptics()) {
      mobileFeatures.hapticFeedback('light');
    }
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      duration: 1000 // 1 second
    });
  };

  // Early return for loading with optimized skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-muted rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Banner Section */}
      {!compact && (
        <div className="relative h-48 overflow-hidden rounded-lg">
          <img 
            src="/lovable-uploads/e91b8d4d-6296-4f40-9156-b6b791a8858f.png" 
            alt="Koch-Chemie Product Catalog"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-2xl font-bold text-white mb-2">Koch-Chemie Product Catalog</h1>
            <p className="text-white/90 text-sm max-w-xs leading-relaxed">
              Discover our complete range of professional automotive detailing products. Each product is available in multiple sizes to meet your specific needs.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {!compact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>

        {(showFilters || compact) && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {categories.map(category => (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Banner */}
      {getTotalItems() > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Ready to checkout</p>
              <p className="text-sm text-muted-foreground">
                {getTotalItems()} items in cart
              </p>
            </div>
            <Button onClick={onCheckout} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Checkout
            </Button>
          </div>
        </Card>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div className="p-3">
              {/* Product Image */}
              <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getCurrentProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                
                {/* Variant Selection */}
                {product.product_variants && product.product_variants.length > 0 && (
                  <div className="mb-3">
                    <Label className="text-sm mb-2 block">Select size</Label>
                    <Select 
                      value={selectedVariants[product.id]?.variantId || ''} 
                      onValueChange={(variantId) => {
                        const variant = product.product_variants.find((v: any) => v.id === variantId);
                        if (variant) {
                          handleVariantChange(product.id, variantId, variant.size, parseFloat(variant.price));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-8">
                        <SelectValue placeholder="Choose size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.product_variants.map((variant: any) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.size} - ₪{parseFloat(variant.price).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-lg text-primary">
                    ₪{(selectedVariants[product.id]?.price || parseFloat(product.product_variants?.[0]?.price || '0')).toLocaleString()}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {product.product_code}
                  </Badge>
                </div>
                
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full h-8 text-sm"
                  size="sm"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};