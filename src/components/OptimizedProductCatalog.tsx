
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FastProductGrid from './FastProductGrid';
import CategoryFilter from './CategoryFilter';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { debounce } from '@/utils/performance';

const OptimizedProductCatalog = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    filterProducts
  } = useOptimizedProducts({
    initialLoad: 16, // Load more initially for better UX
    pageSize: 12,
    enablePreloading: true
  });

  // Debounced search to prevent excessive filtering
  const debouncedFilter = useMemo(
    () => debounce((search: string, category: string) => {
      filterProducts(search, category);
    }, 300),
    [filterProducts]
  );

  // Apply filters when search term or category changes
  useEffect(() => {
    debouncedFilter(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory, debouncedFilter]);

  // Memoized sorted products to prevent unnecessary re-sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const aMin = Math.min(...(a.variants?.map(v => v.price) || [0]));
          const bMin = Math.min(...(b.variants?.map(v => v.price) || [0]));
          return aMin - bMin;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const aMin = Math.min(...(a.variants?.map(v => v.price) || [0]));
          const bMin = Math.min(...(b.variants?.map(v => v.price) || [0]));
          return bMin - aMin;
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategorySelect = useCallback((categorySlug: string | null) => {
    setSelectedCategory(categorySlug || '');
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error loading products: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {t('products.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('products.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('products.search_placeholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CategoryFilter
          categories={[]}
          selectedCategory={selectedCategory || null}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Products Grid */}
      <FastProductGrid
        products={sortedProducts}
        loading={loading}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />

      {/* Results count */}
      {!loading && sortedProducts.length > 0 && (
        <div className="text-center mt-8 text-sm text-muted-foreground">
          Showing {sortedProducts.length} products
        </div>
      )}
    </div>
  );
};

export default OptimizedProductCatalog;
