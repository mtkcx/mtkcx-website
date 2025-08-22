import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ProductGrid from '@/components/ProductGrid';
import { Search, ChevronDown } from 'lucide-react';

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
  allCategories: Array<{
    id: string;
    name: string;
    name_ar?: string;
    name_he?: string;
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
  name_ar?: string;
  name_he?: string;
  slug: string;
  display_order: number;
}

const ProductCatalog = () => {
  const { t, currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );

  console.log('ProductCatalog component rendering...');

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('ProductCatalog: Starting data fetch...');
      
      // Fetch categories first
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      console.log('Categories fetch result:', { categoriesData, catError });
      
      if (categoriesData && !catError) {
        setCategories(categoriesData);
      }

      // Fetch products with full data in one optimized query
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
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
            price
          ),
          product_images!product_images_product_id_fkey (
            id,
            image_url,
            is_primary,
            alt_text
          )
        `)
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      console.log('Products fetch result:', { productsData, prodError });
      
      if (prodError) {
        console.error('Products fetch error:', prodError);
      }

      if (productsData && !prodError) {
        // Transform products to match the interface
        const transformedProducts = productsData
          .filter(product => product.product_variants && product.product_variants.length > 0)
          .map(product => {
            
            // Get the primary image only
            const primaryImage = product.product_images?.find(img => img.is_primary);
            
            // Get the primary category (excluding "All Products")
            let categoryData = null;
            if (product.product_categories && product.product_categories.length > 0) {
              // Filter out "All Products" category and get the first valid category
              const validCategories = product.product_categories.filter(
                pc => pc.categories && pc.categories.name !== 'All Products'
              );
              if (validCategories.length > 0 && validCategories[0].categories) {
                categoryData = validCategories[0].categories;
              } else if (product.product_categories[0] && product.product_categories[0].categories) {
                categoryData = product.product_categories[0].categories;
              }
            }
            
            // Get all categories for the product
            const allCategories = product.product_categories
              ?.map(pc => pc.categories)
              .filter(cat => cat !== null) || [];

            return {
              id: product.id,
              name: product.name,
              name_ar: product.name_ar,
              name_he: product.name_he,
              description: product.description,
              description_ar: product.description_ar,
              description_he: product.description_he,
              product_code: product.product_code,
              image_url: primaryImage?.image_url || product.image_url || '/placeholder.svg',
              category: categoryData || { 
                id: '', 
                name: 'Uncategorized', 
                name_ar: 'غير مصنف', 
                name_he: 'לא מסווג', 
                slug: 'uncategorized' 
              },
              allCategories: allCategories,
              variants: product.product_variants || []
            };
          });

        console.log('Transformed products:', transformedProducts);
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('ProductCatalog fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update selected category from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    setSelectedCategory(categoryParam);
  }, [searchParams]);

  // Optimized filtering with memoization
  const filteredProducts = useMemo(() => {
    console.log('Filtering products with:', { searchTerm, selectedCategory, productsCount: products.length });
    
    return products.filter(product => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchLower) ||
        (product.name_ar && product.name_ar.toLowerCase().includes(searchLower)) ||
        (product.name_he && product.name_he.toLowerCase().includes(searchLower)) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.description_ar && product.description_ar.toLowerCase().includes(searchLower)) ||
        (product.description_he && product.description_he.toLowerCase().includes(searchLower)) ||
        product.product_code.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory = !selectedCategory || 
        product.category.slug === selectedCategory ||
        product.allCategories.some(cat => cat.slug === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  console.log('ProductCatalog render:', { 
    loading, 
    productsCount: products.length, 
    filteredCount: filteredProducts.length,
    categoriesCount: categories.length 
  });

  return (
    <main>
      {/* Hero Banner with Title Overlay */}
      <section className="relative mb-8">
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <img 
                src="/lovable-uploads/3d7dc22e-86ff-41c1-be13-22c68e59c932.png" 
                alt="Koch-Chemie professional color chart and pH indicator system for automotive detailing products"
                className="w-full h-[300px] md:h-[400px] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
                Professional Koch-Chemie Products
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed opacity-95 font-light max-w-3xl mx-auto">
                Premium German automotive detailing products for professional results
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg border">
              <div>
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between bg-background border-2 border-primary/20 hover:border-primary/40"
                    >
                      {selectedCategory ? 
                        categories.find(cat => cat.slug === selectedCategory)?.[
                          currentLanguage === 'ar' ? 'name_ar' : 
                          currentLanguage === 'he' ? 'name_he' : 'name'
                        ] || categories.find(cat => cat.slug === selectedCategory)?.name || 'Categories'
                        : 'All Categories'
                      }
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[250px] max-h-[300px] overflow-y-auto bg-background border-2 border-primary/20 z-50" align="start">
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedCategory(null);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('category');
                        setSearchParams(newParams);
                      }}
                      className="py-3 px-4 cursor-pointer hover:bg-primary/10"
                    >
                      All Categories
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.slug);
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('category', category.slug);
                          setSearchParams(newParams);
                        }}
                        className="py-3 px-4 cursor-pointer hover:bg-primary/10"
                      >
                        {currentLanguage === 'ar' ? (category.name_ar || category.name) :
                         currentLanguage === 'he' ? (category.name_he || category.name) :
                         category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-muted-foreground">
                {loading ? 'Loading products...' : `Showing ${filteredProducts.length} of ${products.length} products`}
              </div>
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
            
            <ProductGrid products={filteredProducts} loading={loading} />
            
            {!loading && filteredProducts.length === 0 && products.length > 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductCatalog;