import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import SEOHead from '@/components/SEOHead';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  keywords?: string;
  meta_description?: string;
  meta_description_ar?: string;
  meta_description_he?: string;
  seo_title?: string;
  seo_title_ar?: string;
  seo_title_he?: string;
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
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch categories with multilingual support
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch products with all related data including multilingual fields
      const { data: productsData } = await supabase
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
          keywords,
          meta_description,
          meta_description_ar,
          meta_description_he,
          seo_title,
          seo_title_ar,
          seo_title_he,
          product_categories (
            categories (
              id,
              name,
              name_ar,
              name_he,
              slug
            )
          ),
          product_variants (
            id,
            size,
            price
          ),
          product_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq('status', 'active');

      if (productsData) {
        const transformedProducts = productsData
          .filter(product => product.product_variants && product.product_variants.length > 0)
          .map(product => {
            const primaryImage = product.product_images?.find(img => img.is_primary) || 
                               product.product_images?.[0];
            
            return {
              id: product.id,
              name: product.name,
              name_ar: product.name_ar,
              name_he: product.name_he,
              description: product.description || '',
              description_ar: product.description_ar,
              description_he: product.description_he,
              product_code: product.product_code || '',
              image_url: primaryImage?.image_url || product.image_url || '/placeholder.svg',
              keywords: product.keywords,
              meta_description: product.meta_description,
              meta_description_ar: product.meta_description_ar,
              meta_description_he: product.meta_description_he,
              seo_title: product.seo_title,
              seo_title_ar: product.seo_title_ar,
              seo_title_he: product.seo_title_he,
              category: product.product_categories && product.product_categories.length > 0 ? {
                id: product.product_categories[0].categories.id,
                name: product.product_categories[0].categories.name,
                name_ar: product.product_categories[0].categories.name_ar,
                name_he: product.product_categories[0].categories.name_he,
                slug: product.product_categories[0].categories.slug,
              } : {
                id: 'uncategorized',
                name: 'Uncategorized',
                slug: 'uncategorized',
              },
              variants: product.product_variants || []
            };
          });

        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions for better performance
    const channel = supabase
      .channel('product-catalog-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Optimized filtering with multilingual support
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Get localized product name and description
      const localizedName = currentLanguage === 'ar' ? (product.name_ar || product.name) :
                           currentLanguage === 'he' ? (product.name_he || product.name) :
                           product.name;
      
      const localizedDescription = currentLanguage === 'ar' ? (product.description_ar || product.description) :
                                  currentLanguage === 'he' ? (product.description_he || product.description) :
                                  product.description;
      
      const matchesSearch = !searchTerm || (
        localizedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        localizedDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.keywords && product.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      const matchesCategory = !selectedCategory || 
                             product.category.slug === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory, currentLanguage]);

  // Optimized product counts calculation
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    products.forEach(product => {
      const categorySlug = product.category.slug;
      counts[categorySlug] = (counts[categorySlug] || 0) + 1;
    });
    
    counts.total = products.length;
    return counts;
  }, [products]);

  // Generate SEO data based on current filters
  const seoData = useMemo(() => {
    const selectedCat = categories.find(cat => cat.slug === selectedCategory);
    const categoryName = selectedCat ? 
      (currentLanguage === 'ar' ? (selectedCat.name_ar || selectedCat.name) :
       currentLanguage === 'he' ? (selectedCat.name_he || selectedCat.name) :
       selectedCat.name) : '';
    
    const title = selectedCategory 
      ? `${categoryName} - Koch-Chemie Professional Car Care | MT Wraps`
      : 'Koch-Chemie Professional Car Care Products | MT Wraps - Official Distributor';
    
    const description = selectedCategory
      ? `Browse professional ${categoryName.toLowerCase()} products from Koch-Chemie. German engineering quality for automotive detailing and car care.`
      : 'Shop premium Koch-Chemie car detailing products. Official distributor offering professional automotive cleaning, polishing, and protection products.';

    const keywords = selectedCategory
      ? `koch chemie, ${categoryName.toLowerCase()}, car detailing, automotive cleaning, professional car care, german car products`
      : 'koch chemie, car detailing, automotive cleaning, professional car care, german car products, car polishing, car protection';

    return { title, description, keywords };
  }, [selectedCategory, categories, currentLanguage]);

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`https://kochchemie-east-hub.lovable.app/products${selectedCategory ? `?category=${selectedCategory}` : ''}`}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": seoData.title,
          "description": seoData.description,
          "url": `https://kochchemie-east-hub.lovable.app/products${selectedCategory ? `?category=${selectedCategory}` : ''}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": filteredProducts.length,
            "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
              "@type": "Product",
              "position": index + 1,
              "name": currentLanguage === 'ar' ? (product.name_ar || product.name) :
                     currentLanguage === 'he' ? (product.name_he || product.name) :
                     product.name,
              "description": currentLanguage === 'ar' ? (product.description_ar || product.description) :
                           currentLanguage === 'he' ? (product.description_he || product.description) :
                           product.description,
              "image": product.image_url,
              "sku": product.product_code,
              "brand": {
                "@type": "Brand",
                "name": "Koch-Chemie"
              }
            }))
          }
        }}
      />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('products.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('products.subtitle')}
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
            <div className="flex justify-center items-center mb-6">
              <div className="text-sm text-muted-foreground text-center">
                {loading ? t('common.loading') : t('products.showing_results').replace('{count}', filteredProducts.length.toString()).replace('{total}', products.length.toString())}
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
      </main>
    </>
  );
};

export default ProductCatalog;