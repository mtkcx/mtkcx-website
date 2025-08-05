import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  variants: ProductVariant[];
}

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch products with their variants
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          category,
          image_url,
          product_variants (
            id,
            size,
            price,
            stock_quantity,
            sku
          )
        `)
        .order('name');

      if (productsError) throw productsError;

      const formattedProducts = productsData.map(product => ({
        ...product,
        variants: product.product_variants || []
      }));

      setProducts(formattedProducts);
      
      // Set default selected variants (first variant for each product)
      const defaultVariants: { [productId: string]: string } = {};
      formattedProducts.forEach(product => {
        if (product.variants.length > 0) {
          defaultVariants[product.id] = product.variants[0].id;
        }
      });
      setSelectedVariants(defaultVariants);

    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedVariant = (product: Product): ProductVariant | null => {
    const selectedVariantId = selectedVariants[product.id];
    return product.variants.find(v => v.id === selectedVariantId) || product.variants[0] || null;
  };

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
  };

  const handleAddToCart = (product: Product) => {
    const selectedVariant = getSelectedVariant(product);
    if (selectedVariant) {
      toast({
        title: 'Added to Cart',
        description: `${product.name} (${selectedVariant.size}) - $${selectedVariant.price}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-6 md:text-5xl">
            Koch-Chemie Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium car care products with multiple sizes available. Select your preferred size for each product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const selectedVariant = getSelectedVariant(product);
            
            return (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {product.description}
                  </CardDescription>
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {product.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {product.variants.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Select Size:
                      </label>
                      <Select
                        value={selectedVariants[product.id] || ''}
                        onValueChange={(value) => handleVariantChange(product.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose size" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.size} - ${variant.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedVariant && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Size: {selectedVariant.size}</span>
                        <span className="text-2xl font-bold text-primary">
                          ${selectedVariant.price}
                        </span>
                      </div>
                      {selectedVariant.sku && (
                        <p className="text-sm text-muted-foreground">
                          SKU: {selectedVariant.sku}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full group-hover:bg-primary/90 transition-colors"
                    onClick={() => handleAddToCart(product)}
                    disabled={!selectedVariant}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No Products Found
            </h3>
            <p className="text-muted-foreground">
              Products will appear here once they are added to the catalog.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;