import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, ShoppingCart, Filter, CreditCard, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MobileProduct {
  id: string;
  name: string;
  description: string;
  product_code: string;
  image_url: string;
  category: {
    id: string;
    name: string;
    slug: string;
    name_he: string;
    name_ar: string;
  };
  variants: Array<{
    id: string;
    size: string;
    price: number;
  }>;
}

interface MobileProductCatalogProps {
  compact?: boolean;
  onCheckout?: () => void;
}

export const MobileProductCatalog: React.FC<MobileProductCatalogProps> = ({ compact = false, onCheckout }) => {
  const { addToCart, getTotalItems } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle category filtering from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories!product_categories_product_id_fkey (
            categories!product_categories_category_id_fkey (
              id,
              name,
              slug,
              name_he,
              name_ar
            )
          ),
          product_variants!product_variants_product_id_fkey (
            id,
            size,
            price
          ),
          product_images!product_images_product_id_fkey (
            image_url,
            is_primary
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;

      // Fetch categories separately
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, name_he, name_ar')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      setCategories(categoriesData || []);

      const transformedProducts = productsData
        ?.filter(product => product.product_variants?.length > 0)
        .map(product => {
          const primaryImage = product.product_images?.find(img => img.is_primary) || 
                             product.product_images?.[0];
          const category = product.product_categories?.[0]?.categories;

          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            product_code: product.product_code || '',
            image_url: primaryImage?.image_url || product.image_url || '/placeholder.svg',
            category: {
              id: category?.id || '',
              name: category?.name || 'Uncategorized',
              slug: category?.slug || 'uncategorized',
              name_he: category?.name_he || '',
              name_ar: category?.name_ar || ''
            },
            variants: product.product_variants || []
          };
        }) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('common.error'),
        description: t('mobile.products.failed_to_load'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category.slug === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEnlargeImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageDialogOpen(true);
  };

  const handleAddToCart = (product: MobileProduct, variantId: string) => {
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    addToCart({
      productId: product.id,
      productName: product.name,
      productCode: product.product_code,
      variantId: variantId,
      variantSize: variant.size,
      price: variant.price,
      imageUrl: product.image_url,
      categoryName: product.category.name
    });

    toast({
      title: t('mobile.products.added_to_cart'),
      description: `${product.name} (${variant.size}) ${t('mobile.products.added_description')}`
    });
  };

  const handleQuickAdd = (product: MobileProduct, variantId: string) => {
    handleAddToCart(product, variantId);
    setSelectedProduct(null);
    setSelectedVariant('');
  };

  const handleViewProduct = (product: MobileProduct) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants[0]?.id || '');
  };

  const handleGoToCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      // Don't navigate to external checkout, use the mobile checkout component
      // This will be handled by the parent component
      onCheckout && onCheckout();
    }
  };

  const formatPrice = (price: number) => {
    return `₪${price.toLocaleString()}`;
  };

  const displayProducts = compact ? filteredProducts.slice(0, 6) : filteredProducts;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-32 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
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
              {t('categories.all_products')}
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
              <p className="font-semibold">{t('mobile.products.cart_ready')}</p>
              <p className="text-sm text-muted-foreground">
                {getTotalItems()} {t('mobile.products.items_text')}
              </p>
            </div>
            <Button onClick={handleGoToCheckout} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('mobile.products.checkout')}
            </Button>
          </div>
        </Card>
      )}

      {/* Product List */}
      <div className="space-y-4">
        {displayProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div className="flex gap-3 p-3">
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute inset-0 w-16 h-16 p-0 bg-black/60 hover:bg-black/70 opacity-0 hover:opacity-100 transition-opacity rounded"
                  onClick={() => handleEnlargeImage(product.image_url)}
                >
                  <Eye className="h-4 w-4 text-white" />
                </Button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm">{product.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {product.product_code}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-primary">
                    {product.variants.length === 1 ? (
                      formatPrice(product.variants[0].price)
                    ) : (
                      `${formatPrice(Math.min(...product.variants.map(v => v.price)))} - ${formatPrice(Math.max(...product.variants.map(v => v.price)))}`
                    )}
                  </div>
                  {product.variants.length === 1 ? (
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product, product.variants[0].id)}
                      className="h-8 px-3"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          className="h-8 px-3"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Select
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{product.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={selectedProduct && selectedVariant ? 
                              (selectedProduct.variants.find(v => v.id === selectedVariant)?.size === '1L' ? 
                                product.image_url.replace('.png', '-1L.png').replace('.jpg', '-1L.jpg') : 
                                product.image_url) : 
                              product.image_url}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = product.image_url;
                            }}
                          />
                          <p className="text-sm text-muted-foreground">
                            {product.description}
                          </p>
                          
                          <div className="space-y-3">
                            <label className="text-sm font-medium">Select Size:</label>
                            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose size" />
                              </SelectTrigger>
                              <SelectContent>
                                {product.variants.map(variant => (
                                  <SelectItem key={variant.id} value={variant.id}>
                                    {variant.size} - {formatPrice(variant.price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button
                            onClick={() => handleQuickAdd(product, selectedVariant)}
                            disabled={!selectedVariant}
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Show More Button (for compact mode) */}
      {compact && filteredProducts.length > 6 && (
        <Button variant="outline" className="w-full">
          View All {filteredProducts.length} Products
        </Button>
      )}

      {/* Empty State */}
      {!loading && displayProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found</p>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Image Enlargement Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Product Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={selectedImageUrl}
              alt="Product enlarged view"
              className="w-full max-h-96 object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};