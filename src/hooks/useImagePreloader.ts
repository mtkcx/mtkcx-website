import { useCallback, useEffect, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
}

export const useImagePreloader = () => {
  const preloadedImages = useRef(new Set<string>());
  const preloadQueue = useRef<Array<{ src: string; options: PreloadOptions }>>([]);
  const isProcessing = useRef(false);

  const createOptimizedImageUrl = useCallback((src: string, options: PreloadOptions = {}) => {
    if (!src) return src;
    
    // For Lovable uploads, add optimization parameters
    if (src.includes('lovable-uploads')) {
      const url = new URL(src, window.location.origin);
      if (options.quality) url.searchParams.set('q', options.quality.toString());
      if (options.format && options.format !== 'auto') {
        url.searchParams.set('fm', options.format);
      }
      // Add responsive sizing for mobile
      if (window.innerWidth <= 768) {
        url.searchParams.set('w', '800');
      } else if (window.innerWidth <= 1024) {
        url.searchParams.set('w', '1200');
      }
      return url.toString();
    }
    
    return src;
  }, []);

  const preloadImage = useCallback((src: string, options: PreloadOptions = {}) => {
    if (!src || preloadedImages.current.has(src)) return Promise.resolve();

    const optimizedSrc = createOptimizedImageUrl(src, options);
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      // Set loading and fetchpriority attributes
      if (options.priority === 'high') {
        img.fetchPriority = 'high';
      }
      
      img.src = optimizedSrc;
    });
  }, [createOptimizedImageUrl]);

  const batchPreload = useCallback(async (sources: Array<{ src: string; options?: PreloadOptions }>) => {
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    
    try {
      // Process high priority images first
      const highPriority = sources.filter(item => item.options?.priority === 'high');
      const lowPriority = sources.filter(item => item.options?.priority !== 'high');
      
      // Preload high priority images immediately
      await Promise.allSettled(
        highPriority.map(item => preloadImage(item.src, item.options))
      );
      
      // Preload low priority images with throttling
      for (let i = 0; i < lowPriority.length; i += 3) {
        const batch = lowPriority.slice(i, i + 3);
        await Promise.allSettled(
          batch.map(item => preloadImage(item.src, item.options))
        );
        
        // Small delay between batches to prevent overwhelming the network
        if (i + 3 < lowPriority.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally {
      isProcessing.current = false;
    }
  }, [preloadImage]);

  const preloadNextPage = useCallback((images: string[]) => {
    // Preload images for the next page/section with low priority
    const imagesToPreload = images
      .filter(src => !preloadedImages.current.has(src))
      .slice(0, 6) // Limit to prevent excessive preloading
      .map(src => ({ src, options: { priority: 'low' as const, quality: 80 } }));
    
    if (imagesToPreload.length > 0) {
      batchPreload(imagesToPreload);
    }
  }, [batchPreload]);

  return {
    preloadImage,
    batchPreload,
    preloadNextPage,
    createOptimizedImageUrl,
    isPreloaded: (src: string) => preloadedImages.current.has(src)
  };
};