import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in cache
}

interface CachedItem<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface OfflineStore {
  products: Array<{
    id: string;
    name: string;
    price?: number;
    image_url?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  lastSync: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 1000 * 60 * 15, // 15 minutes
  maxSize: 100
};

export const useOfflineCache = <T>(config: Partial<CacheConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [cache, setCache] = useState<Map<string, CachedItem<T>>>(new Map());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache management
  const set = useCallback((key: string, data: T) => {
    setCache(prev => {
      const newCache = new Map(prev);
      
      // Remove oldest items if cache is full
      if (newCache.size >= finalConfig.maxSize) {
        const oldestKey = Array.from(newCache.keys())[0];
        newCache.delete(oldestKey);
      }

      newCache.set(key, {
        data,
        timestamp: Date.now(),
        key
      });

      // Store in localStorage for persistence
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data,
          timestamp: Date.now(),
          key
        }));
      } catch (error) {
        console.warn('Failed to store in localStorage:', error);
      }

      return newCache;
    });
  }, [finalConfig.maxSize]);

  const get = useCallback((key: string): T | null => {
    // Check memory cache first
    const memoryItem = cache.get(key);
    if (memoryItem && Date.now() - memoryItem.timestamp < finalConfig.ttl) {
      return memoryItem.data;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const item: CachedItem<T> = JSON.parse(stored);
        if (Date.now() - item.timestamp < finalConfig.ttl) {
          // Restore to memory cache
          setCache(prev => new Map(prev).set(key, item));
          return item.data;
        } else {
          // Remove expired item
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    return null;
  }, [cache, finalConfig.ttl]);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
    
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
    
    // Clear all cache items from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, []);

  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  return {
    set,
    get,
    remove,
    clear,
    has,
    isOnline,
    size: cache.size
  };
};

export const useOfflineProducts = () => {
  const cache = useOfflineCache<OfflineStore>({ ttl: 1000 * 60 * 30 }); // 30 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncProducts = useCallback(async (force = false): Promise<OfflineStore | null> => {
    const cacheKey = 'offline_products';
    
    // Return cached data if available and not forced
    if (!force && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Only sync if online
    if (!cache.isOnline && !force) {
      return cache.get(cacheKey);
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch products with all necessary data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          product_code,
          image_url,
          status,
          product_categories!product_categories_product_id_fkey (
            categories!product_categories_category_id_fkey (
              id,
              name,
              slug
            )
          ),
          product_variants!product_variants_product_id_fkey (
            id,
            size,
            price,
            stock_quantity
          ),
          product_images!product_images_product_id_fkey (
            image_url,
            is_primary,
            alt_text
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (categoriesError) throw categoriesError;

      const offlineData: OfflineStore = {
        products: productsData || [],
        categories: categoriesData || [],
        lastSync: Date.now()
      };

      cache.set(cacheKey, offlineData);
      return offlineData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync products';
      setError(errorMessage);
      console.error('Product sync error:', err);
      
      // Return cached data if available
      return cache.get(cacheKey);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const getProducts = useCallback((): OfflineStore | null => {
    return cache.get('offline_products');
  }, [cache]);

  const clearCache = useCallback(() => {
    cache.remove('offline_products');
  }, [cache]);

  // Auto-sync on component mount and when coming back online
  useEffect(() => {
    if (cache.isOnline) {
      syncProducts();
    }
  }, [cache.isOnline, syncProducts]);

  return {
    syncProducts,
    getProducts,
    clearCache,
    loading,
    error,
    isOnline: cache.isOnline,
    cacheSize: cache.size
  };
};