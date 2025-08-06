import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from './ProductGrid';
import CategoryFilter from './CategoryFilter';
import { useLanguage } from '@/contexts/LanguageContext';

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
  allCategories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
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
  const { t } = useLanguage();
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
        console.log('📝 Fetching categories...');
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order');

        if (categoriesError) throw categoriesError;
        console.log('✅ Categories fetched:', categoriesData?.length || 0, categoriesData);

        // Fetch products with categories via junction table, variants, and images
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_categories(
              category_id,
              categories(id, name, slug)
            ),
            product_variants!fk_product_variants_product_id (
              id,
              size,
              price
            ),
            product_images (
              id,
              image_url,
              is_primary,
              alt_text
            )
          `)
          .eq('status', 'active')
          .order('name');

        if (productsError) throw productsError;

        // Transform and filter the data to match our interface
        const transformedProducts = productsData?.filter(product => {
          // Only show products that have at least one variant
          const hasVariants = product.product_variants && product.product_variants.length > 0;
          return hasVariants;
        }).map(product => {
          // Get primary image or first available image
          const primaryImage = product.product_images?.find(img => img.is_primary) || 
                               product.product_images?.[0];
          
          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            product_code: product.product_code || '',
            image_url: primaryImage?.image_url || product.image_url || '/placeholder.svg',
            category: product.product_categories && product.product_categories.length > 0 ? {
              id: product.product_categories[0].categories.id,
              name: product.product_categories[0].categories.name,
              slug: product.product_categories[0].categories.slug,
            } : {
              id: 'uncategorized',
              name: 'Uncategorized',
              slug: 'uncategorized',
            },
            // Store all categories this product belongs to for filtering
            allCategories: product.product_categories?.map(pc => pc.categories) || [],
            variants: product.product_variants || []
          };
        }) || [];

        setCategories(categoriesData || []);
        setProducts(transformedProducts);
        console.log('✅ Final state - Categories:', categoriesData?.length, 'Products:', transformedProducts.length);
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
    
    const matchesCategory = !selectedCategory || 
                           product.allCategories.some(cat => cat.slug === selectedCategory) ||
                           (selectedCategory === 'uncategorized' && product.allCategories.length === 0);
    
    return matchesSearch && matchesCategory;
  });

  const getProductCounts = () => {
    const counts: Record<string, number> = {
      total: products.length
    };
    
    // Count products for each category (including categories with 0 products)
    categories.forEach(category => {
      counts[category.slug] = products.filter(p => 
        p.allCategories.some(cat => cat.slug === category.slug)
      ).length;
    });
    
    // Count uncategorized products (products with no categories)
    counts['uncategorized'] = products.filter(p => p.allCategories.length === 0).length;
    
    return counts;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-6">{t('products.title')}</h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('products.subtitle')}
        </p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('products.search_placeholder')}
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
            {t('products.filters')}
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
          <div className="flex justify-center items-center mb-6">
            <div className="text-sm text-muted-foreground text-center">
              {loading ? t('products.loading') : t('products.showing_results').replace('{count}', filteredProducts.length.toString()).replace('{total}', products.length.toString())}
            </div>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="ml-4"
              >
                {t('products.clear_filters')}
              </Button>
            )}
          </div>
          
          <ProductGrid products={filteredProducts} loading={loading} />
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4 text-center">
                {t('products.no_products')}
              </p>
              <div className="text-center">
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}>
                  {t('products.clear_all_filters')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;