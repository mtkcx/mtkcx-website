import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from './ProductGrid';
import CategoryFilter from './CategoryFilter';

interface Product {
  id: string;
  name: string;
  description: string;
  product_code: string;
  image_url: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    size: string;
    price: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order');

        if (categoriesError) throw categoriesError;

        // Fetch products with categories and variants
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories!inner (
              id,
              name,
              slug
            ),
            product_variants!fk_product_variants_product_id (
              id,
              size,
              price
            )
          `)
          .eq('status', 'active')
          .order('name');

        if (productsError) throw productsError;

        // Transform the data to match our interface
        const transformedProducts = productsData?.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          product_code: product.product_code,
          image_url: product.image_url,
          category: {
            id: product.categories.id,
            name: product.categories.name,
            slug: product.categories.slug,
          },
          variants: product.product_variants || []
        })) || [];

        setCategories(categoriesData || []);
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductCounts = () => {
    const counts: Record<string, number> = {
      total: products.length
    };
    
    categories.forEach(category => {
      counts[category.slug] = products.filter(p => p.category.slug === category.slug).length;
    });
    
    return counts;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-6">KochChemie Product Catalog</h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover our complete range of professional automotive detailing products. 
          Each product is available in multiple sizes to meet your specific needs.
        </p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products by name, description, or product code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-card p-6 rounded-lg border">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              productCounts={getProductCounts()}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `Showing ${filteredProducts.length} of ${products.length} products`}
            </div>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Clear filters
              </Button>
            )}
          </div>
          
          <ProductGrid products={filteredProducts} loading={loading} />
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No products found matching your criteria.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;