import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Filter, Grid, List } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
}

export const MobileProductCatalog: React.FC<MobileProductCatalogProps> = ({ compact = false }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

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
                  
                  {/* Variants */}
                  <div className="space-y-2">
                    {product.variants.slice(0, 2).map(variant => (
                      <div key={variant.id} className="flex items-center justify-between">
                        <span className="text-xs">{variant.size}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">${variant.price}</span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product, variant.id)}
                            className="h-7 px-2"
                          >
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {product.variants.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{product.variants.length - 2} more sizes
                      </p>
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
                    <div className="text-sm">
                      {product.variants.length === 1 ? (
                        <span className="font-medium">${product.variants[0].price}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          ${Math.min(...product.variants.map(v => v.price))} - 
                          ${Math.max(...product.variants.map(v => v.price))}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product, product.variants[0].id)}
                      className="h-8 px-3"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add
                    </Button>
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