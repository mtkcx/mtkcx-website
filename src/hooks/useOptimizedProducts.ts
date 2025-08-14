
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useImagePreloader } from '@/hooks/useImagePreloader';

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

interface UseOptimizedProductsProps {
  initialLoad?: number;
  pageSize?: number;
  enablePreloading?: boolean;
}

export const useOptimizedProducts = ({
  initialLoad = 12,
  pageSize = 12,
  enablePreloading = true
}: UseOptimizedProductsProps = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { batchPreload, preloadNextPage } = useImagePreloader();

  // Optimized data fetcher with select only needed fields
  const fetchProducts = useCallback(async (offset = 0, limit = initialLoad) => {
    try {
      const { data: productsData, error: productsError } = await supabase
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
          status,
          product_categories!inner(
            categories!inner(
              id,
              name,
              name_ar,
              name_he,
              slug
            )
          ),
          product_variants(
            id,
            size,
            price
          )
        `)
        .eq('status', 'active')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const formattedProducts: Product[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        name_ar: product.name_ar,
        name_he: product.name_he,
        description: product.description || '',
        description_ar: product.description_ar,
        description_he: product.description_he,
        product_code: product.product_code || '',
        image_url: product.image_url || '',
        category: {
          name: product.product_categories?.[0]?.categories?.name || 'Uncategorized',
          name_ar: product.product_categories?.[0]?.categories?.name_ar,
          name_he: product.product_categories?.[0]?.categories?.name_he,
          slug: product.product_categories?.[0]?.categories?.slug || 'uncategorized'
        },
        variants: (product.product_variants || []).map(variant => ({
          id: variant.id,
          size: variant.size,
          price: variant.price
        }))
      }));

      return formattedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }, [initialLoad]);

  // Initial load with preloading
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const initialProducts = await fetchProducts(0, initialLoad);
        setProducts(initialProducts);
        setAllProducts(initialProducts);
        setHasMore(initialProducts.length === initialLoad);

        // Preload critical images immediately
        if (enablePreloading && initialProducts.length > 0) {
          const criticalImages = initialProducts
            .slice(0, 6) // First 6 products
            .map(p => p.image_url)
            .filter(Boolean)
            .map(src => ({ 
              src, 
              options: { priority: 'high' as const, quality: 85 } 
            }));

          if (criticalImages.length > 0) {
            batchPreload(criticalImages);
          }

          // Preload remaining images with lower priority
          const remainingImages = initialProducts
            .slice(6)
            .map(p => p.image_url)
            .filter(Boolean);
          
          if (remainingImages.length > 0) {
            setTimeout(() => preloadNextPage(remainingImages), 100);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, [fetchProducts, initialLoad, enablePreloading, batchPreload, preloadNextPage]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const offset = currentPage * pageSize;
      const moreProducts = await fetchProducts(offset, pageSize);
      
      if (moreProducts.length === 0) {
        setHasMore(false);
        return;
      }

      setProducts(prev => [...prev, ...moreProducts]);
      setAllProducts(prev => [...prev, ...moreProducts]);
      setCurrentPage(prev => prev + 1);
      setHasMore(moreProducts.length === pageSize);

      // Preload new images
      if (enablePreloading) {
        const newImages = moreProducts
          .map(p => p.image_url)
          .filter(Boolean);
        
        if (newImages.length > 0) {
          preloadNextPage(newImages);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more products');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, pageSize, fetchProducts, enablePreloading, preloadNextPage]);

  // Memoized filter function
  const filterProducts = useCallback((searchTerm: string, categoryFilter: string) => {
    if (!searchTerm && !categoryFilter) {
      setProducts(allProducts);
      return;
    }

    const filtered = allProducts.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || 
        product.category.slug === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    setProducts(filtered);
  }, [allProducts]);

  return {
    products,
    allProducts,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    filterProducts,
    refresh: () => {
      setCurrentPage(1);
      setProducts([]);
      setAllProducts([]);
      setHasMore(true);
    }
  };
};
