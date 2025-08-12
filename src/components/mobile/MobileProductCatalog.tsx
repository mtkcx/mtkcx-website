import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, ShoppingCart, Filter, CreditCard, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ImageEnlargementDialog } from './ImageEnlargementDialog';
import { MobileProductDetailDialog } from './MobileProductDetailDialog';

interface MobileProductCatalogProps {
  compact?: boolean;
  onCheckout?: () => void;
}

export const MobileProductCatalog: React.FC<MobileProductCatalogProps> = ({ compact = false, onCheckout }) => {
  const { addToCart: addItemToCart, getTotalItems } = useCart();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string, name_ar?: string, name_he?: string, slug: string}>>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { variantId: string; size: string; price: number }>>({});
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
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

  // Auto-select primary variant when products load
  useEffect(() => {
    if (products.length > 0) {
      const newSelectedVariants: Record<string, { variantId: string; size: string; price: number }> = {};
      products.forEach(product => {
        if (product.product_variants?.length > 0) {
          // Find primary variant or default to first variant
          const primaryVariant = product.product_variants.find((v: any) => v.is_primary) || product.product_variants[0];
          if (primaryVariant) {
            newSelectedVariants[product.id] = {
              variantId: primaryVariant.id,
              size: primaryVariant.size,
              price: parseFloat(primaryVariant.price)
            };
          }
        }
      });
      setSelectedVariants(newSelectedVariants);
    }
  }, [products]);

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
          name_ar,
          name_he,
          description,
          description_ar,
          description_he,
          product_code,
          image_url,
          safety_icons,
          featured,
          product_categories!product_categories_product_id_fkey (
            categories!product_categories_category_id_fkey (
              id,
              name,
              name_ar,
              name_he,
              slug
            )
          ),
          product_variants!product_variants_product_id_fkey (
            id,
            size,
            price,
            is_primary
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
              categoryMap.set(cat.slug, { 
                id: cat.id, 
                name: cat.name, 
                name_ar: cat.name_ar,
                name_he: cat.name_he,
                slug: cat.slug 
              });
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
      // Get localized product name
      const localizedName = currentLanguage === 'ar' ? (product.name_ar || product.name) :
                           currentLanguage === 'he' ? (product.name_he || product.name) :
                           product.name;
      
      const matchesSearch = !searchTerm || 
        localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        product.product_categories?.some((pc: any) => pc.categories?.slug === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory, currentLanguage]);

  const handleVariantChange = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.product_variants) {
      const variant = product.product_variants.find((v: any) => v.id === variantId);
      if (variant) {
        setSelectedVariants(prev => ({
          ...prev,
          [productId]: { 
            variantId, 
            size: variant.size, 
            price: parseFloat(variant.price) 
          }
        }));
      }
    }
  };

  const getSelectedVariant = (productId: string) => {
    return selectedVariants[productId];
  };

  const getCurrentProductImage = (product: any) => {
    const selectedVariant = getSelectedVariant(product.id);
    
    if (product.product_images?.length > 0) {
      // If we have a selected variant, try to find its specific image
      if (selectedVariant) {
        const variantImage = product.product_images?.find((img: any) => 
          img.variant_id === selectedVariant.variantId
        );
        if (variantImage) {
          return variantImage.image_url;
        }
      }
      
      // If no selected variant or no variant-specific image, try primary image
      const primaryImage = product.product_images?.find((img: any) => img.is_primary);
      if (primaryImage) {
        return primaryImage.image_url;
      }
      
      // Fall back to first image
      if (product.product_images?.[0]) {
        return product.product_images[0].image_url;
      }
    }
    
    // Final fallback to main product image or placeholder
    return product.image_url || '/placeholder.svg';
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
    
    const localizedName = currentLanguage === 'ar' ? (product.name_ar || product.name) :
                         currentLanguage === 'he' ? (product.name_he || product.name) :
                         product.name;
    
    toast({
      title: t('mobile.products.added_to_cart'),
      description: `${localizedName} ${t('mobile.products.added_description')}`,
      duration: 2000
    });
  };

  const handleImageClick = useCallback((imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowImageDialog(true);
  }, []);

  const handleProductClick = useCallback((product: any) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  }, []);

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
            <h1 className="text-2xl font-bold text-white mb-2">{t('mobile.products.banner_title')}</h1>
            <p className="text-white/90 text-sm max-w-xs leading-relaxed">
              {t('mobile.products.banner_subtitle')}
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
              placeholder={t('mobile.products.search_placeholder')}
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
              {t('mobile.products.all_categories')}
            </Button>
            {categories.map(category => {
              const categoryName = currentLanguage === 'ar' ? (category.name_ar || category.name) :
                                  currentLanguage === 'he' ? (category.name_he || category.name) :
                                  category.name;
              return (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {categoryName}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout Banner */}
      {getTotalItems() > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{t('mobile.products.cart_ready')}</p>
              <p className="text-sm text-muted-foreground">
                {getTotalItems()} {t('mobile.products.items_text')}
              </p>
            </div>
            <Button onClick={onCheckout} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('mobile.products.checkout')}
            </Button>
          </div>
        </Card>
      )}

      {/* Product Grid - List Style */}
      <div className="space-y-3">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div 
              className="flex gap-3 p-3 cursor-pointer" 
              onClick={() => handleProductClick(product)}
            >
              <div className="relative">
                <img
                  src={getCurrentProductImage(product)}
                  alt={currentLanguage === 'ar' ? (product.name_ar || product.name) :
                       currentLanguage === 'he' ? (product.name_he || product.name) :
                       product.name}
                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute inset-0 w-20 h-20 p-0 bg-black/60 hover:bg-black/70 opacity-0 hover:opacity-100 transition-opacity rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(getCurrentProductImage(product));
                  }}
                >
                  <Eye className="h-4 w-4 text-white" />
                </Button>
              </div>
              
               {/* Product Info */}
               <div className="flex-1 space-y-2">
                 <div className="flex items-start justify-between">
                   <h3 className="font-medium text-sm line-clamp-2 flex-1">
                     {currentLanguage === 'ar' ? (product.name_ar || product.name) :
                      currentLanguage === 'he' ? (product.name_he || product.name) :
                      product.name}
                   </h3>
                   <Badge variant="secondary" className="text-xs ml-2">
                     {product.product_code}
                   </Badge>
                 </div>
                 
                 {/* Product Description Preview */}
                 {(product.description || product.description_ar || product.description_he) && (
                   <p className="text-xs text-muted-foreground line-clamp-2">
                     {currentLanguage === 'ar' ? (product.description_ar || product.description) :
                      currentLanguage === 'he' ? (product.description_he || product.description) :
                      product.description}
                   </p>
                 )}
                 
                  {/* Price and Size Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-primary text-sm">
                        ₪{(selectedVariants[product.id]?.price || parseFloat(product.product_variants?.[0]?.price || '0')).toLocaleString()}
                      </div>
                      {product.product_variants && product.product_variants.length > 1 && (
                        <div className="flex-1 max-w-[100px] ml-2">
                          <Select 
                            value={selectedVariants[product.id]?.variantId || ''} 
                            onValueChange={(variantId) => handleVariantChange(product.id, variantId)}
                          >
                            <SelectTrigger className="h-6 text-xs bg-background border border-muted">
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent className="z-50 bg-background">
                              {product.product_variants.map((variant: any) => (
                                <SelectItem key={variant.id} value={variant.id} className="text-xs">
                                  {variant.size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        size="sm"
                        className="h-7 px-2 text-xs flex-1"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {t('mobile.products.add')}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex-1"
                      >
                        {t('mobile.products.view')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-2">{t('mobile.products.no_products')}</div>
          <div className="text-sm text-muted-foreground">{t('mobile.products.no_products_desc')}</div>
        </div>
      )}

      {/* Image Enlargement Dialog */}
      <ImageEnlargementDialog 
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        imageUrl={selectedImageUrl}
        title="Product Image"
      />

      {/* Product Detail Dialog */}
      <MobileProductDetailDialog
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        selectedVariants={selectedVariants}
        onVariantChange={handleVariantChange}
        getCurrentProductImage={getCurrentProductImage}
      />
    </div>
  );
};