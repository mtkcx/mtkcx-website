import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  product_code: string;
  image_url: string;
  product_variants: Array<{
    id: string;
    size: string;
    price: number;
  }>;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          product_code,
          image_url,
          product_variants!product_variants_product_id_fkey (
            id,
            size,
            price
          )
        `)
        .eq('status', 'active')
        .limit(10);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      console.log('Products fetched:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    const firstVariant = product.product_variants?.[0];
    if (!firstVariant) return;

    const cartItem = {
      productId: product.id,
      productName: product.name,
      productCode: product.product_code,
      variantId: firstVariant.id,
      variantSize: firstVariant.size,
      price: firstVariant.price,
      quantity: 1,
      imageUrl: product.image_url || '/placeholder.svg',
      categoryName: 'Products'
    };

    addToCart(cartItem);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Professional Koch-Chemie car care products
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Code: {product.product_code}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {product.product_variants && product.product_variants.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          ₪{product.product_variants[0].price}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.product_variants[0].size}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm ? 'No products match your search.' : 'No products available.'}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;