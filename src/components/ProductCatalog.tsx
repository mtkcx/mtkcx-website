import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import { Search } from 'lucide-react';

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
    id: string;
    name: string;
    name_ar?: string;
    name_he?: string;
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
  name_ar?: string;
  name_he?: string;
  slug: string;
  display_order: number;
}

const ProductCatalog = () => {
  const { t, currentLanguage } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fast initial load - get basic product info first
  const fetchBasicData = async () => {
    try {
      setLoading(true);
      
      // Start both queries in parallel for faster loading
      const [categoriesPromise, productsPromise] = await Promise.all([
        // Fetch categories (fast query)
        supabase
          .from('categories')
          .select('id, name, name_ar, name_he, slug, display_order')
          .order('display_order'),
        
        // Fetch basic product info first (much faster than complex joins)
        supabase
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
            image_url
          `)
          .eq('status', 'active')
          .order('name')
      ]);

      // Set categories immediately
      if (categoriesPromise.data) {
        setCategories(categoriesPromise.data);
      }

      // Set basic products immediately, then enhance with variants and categories
      if (productsPromise.data) {
        const basicProducts = productsPromise.data.map(product => ({
          ...product,
          description: product.description || '',
          product_code: product.product_code || '',
          image_url: product.image_url || '/placeholder.svg',
          category: {
            id: 'loading',
            name: 'Loading...',
            slug: 'loading'
          },
          variants: []
        }));
        
        setProducts(basicProducts);
        setLoading(false); // Show products immediately, even if incomplete
        
        // Now fetch the detailed data in the background
        fetchDetailedData(productsPromise.data.map(p => p.id));
      }
    } catch (error) {
      console.error('Error fetching basic data:', error);
      setLoading(false);
    }
  };

  // Fetch detailed product data in background
  const fetchDetailedData = async (productIds: string[]) => {
    try {
      // Batch fetch variants and categories for all products
      const [variantsResult, categoriesResult, imagesResult] = await Promise.all([
        supabase
          .from('product_variants')
          .select('id, size, price, product_id')
          .in('product_id', productIds),
        
        supabase
          .from('product_categories')
          .select(`
            product_id,
            categories (id, name, name_ar, name_he, slug)
          `)
          .in('product_id', productIds),
        
        supabase
          .from('product_images')
          .select('product_id, image_url, is_primary')
          .in('product_id', productIds)
          .eq('is_primary', true)
      ]);

      // Create lookup maps for O(1) access
      const variantsByProduct = new Map();
      const categoriesByProduct = new Map();
      const imagesByProduct = new Map();

      variantsResult.data?.forEach(variant => {
        if (!variantsByProduct.has(variant.product_id)) {
          variantsByProduct.set(variant.product_id, []);
        }
        variantsByProduct.get(variant.product_id).push(variant);
      });

      categoriesResult.data?.forEach(pc => {
        if (pc.categories) {
          categoriesByProduct.set(pc.product_id, pc.categories);
        }
      });

      imagesResult.data?.forEach(img => {
        imagesByProduct.set(img.product_id, img.image_url);
      });

      // Update products with detailed data
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const variants = variantsByProduct.get(product.id) || [];
          const category = categoriesByProduct.get(product.id) || {
            id: 'uncategorized',
            name: 'Uncategorized',
            slug: 'uncategorized'
          };
          const primaryImage = imagesByProduct.get(product.id);

          return {
            ...product,
            image_url: primaryImage || product.image_url,
            category,
            variants
          };
        })
      );
    } catch (error) {
      console.error('Error fetching detailed data:', error);
    }
  };

  useEffect(() => {
    fetchBasicData();
  }, []);

  // Optimized filtering with memoization
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    return products.filter(product => {
      // Skip products still loading detailed data
      if (product.category.id === 'loading') return false;
      
      // Get localized content
      const localizedName = currentLanguage === 'ar' ? (product.name_ar || product.name) :
                           currentLanguage === 'he' ? (product.name_he || product.name) :
                           product.name;
      
      const localizedDescription = currentLanguage === 'ar' ? (product.description_ar || product.description) :
                                  currentLanguage === 'he' ? (product.description_he || product.description) :
                                  product.description;
      
      const matchesSearch = !searchTerm || (
        localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        localizedDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesCategory = !selectedCategory || product.category.slug === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory, currentLanguage]);

  // Optimized product counts
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    products.forEach(product => {
      if (product.category.id !== 'loading') {
        const categorySlug = product.category.slug;
        counts[categorySlug] = (counts[categorySlug] || 0) + 1;
      }
    });
    
    counts.total = products.filter(p => p.category.id !== 'loading').length;
    return counts;
  }, [products]);

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          {t('products.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('products.subtitle')}
        </p>
      </div>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-lg border">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              productCounts={productCounts}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading products...' : `Showing ${filteredProducts.length} of ${productCounts.total} products`}
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
          
          <ProductGrid products={filteredProducts} loading={loading} />
          
          {!loading && filteredProducts.length === 0 && productCounts.total > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No products found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && productCounts.total === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProductCatalog;