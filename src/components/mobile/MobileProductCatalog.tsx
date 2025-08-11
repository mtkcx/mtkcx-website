import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, ShoppingCart, Filter, Grid, List, Package, CreditCard, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
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
    name: string;
    slug: string;
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories!product_categories_product_id_fkey (
            categories!product_categories_category_id_fkey (
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
            image_url,
            is_primary
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      const transformedProducts = data
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
              name: category?.name || 'Uncategorized',
              slug: category?.slug || 'uncategorized',
            },
            variants: product.product_variants || []
          };
        }) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
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

  const categories = Array.from(new Set(products.map(p => p.category.slug)))
    .map(slug => {
      const product = products.find(p => p.category.slug === slug);
      return product ? { slug, name: product.category.name } : null;
    })
    .filter(Boolean);

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
      title: 'Added to Cart',
      description: `${product.name} (${variant.size}) added to cart`
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
      navigate('/checkout');
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
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Koch-Chemie Products</h2>
          <div className="flex items-center gap-2">
            {getTotalItems() > 0 && (
              <Button
                onClick={handleGoToCheckout}
                className="flex items-center gap-2"
                size="sm"
              >
                <CreditCard className="h-4 w-4" />
                Checkout ({getTotalItems()})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {(showFilters || compact) && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => category && (
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
              <p className="font-semibold">Cart Ready</p>
              <p className="text-sm text-muted-foreground">
                {getTotalItems()} items in your cart
              </p>
            </div>
            <Button onClick={handleGoToCheckout} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Checkout
            </Button>
          </div>
        </Card>
      )}

      {/* Product Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-2 gap-4" 
          : "space-y-4"
      }>
        {displayProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            {viewMode === 'grid' ? (
              // Grid View
              <div className="space-y-3">
                <div className="aspect-square relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 text-xs"
                  >
                    {product.product_code}
                  </Badge>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Price Range */}
                  <div className="text-sm font-medium text-primary">
                    {product.variants.length === 1 ? (
                      formatPrice(product.variants[0].price)
                    ) : (
                      `${formatPrice(Math.min(...product.variants.map(v => v.price)))} - ${formatPrice(Math.max(...product.variants.map(v => v.price)))}`
                    )}
                  </div>

                  {/* Quick Add or View Options */}
                  <div className="flex gap-2">
                    {product.variants.length === 1 ? (
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product, product.variants[0].id)}
                        className="flex-1 h-8"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                    ) : (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProduct(product)}
                              className="flex-1 h-8"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{product.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded"
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
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product, product.variants[0].id)}
                          className="h-8 px-3"
                        >
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <div className="flex gap-3 p-3">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
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
                            <Package className="h-3 w-3 mr-1" />
                            Select
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded"
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
            )}
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
    </div>
  );
};