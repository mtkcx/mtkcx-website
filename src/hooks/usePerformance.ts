import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = (options: LazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || (triggerOnce && hasLoaded)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasLoaded]);

  return {
    elementRef,
    isVisible,
    hasLoaded
  };
};

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.svg',
  onLoad,
  onError
}) => {
  const { elementRef, isVisible } = useLazyLoad();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  return React.createElement('div', {
    ref: elementRef as any,
    className: `relative ${className}`
  }, [
    !imageLoaded && !imageError && React.createElement('div', {
      key: 'skeleton',
      className: 'absolute inset-0 bg-muted animate-pulse rounded'
    }),
    isVisible && React.createElement('img', {
      key: 'image',
      src: imageError ? placeholder : src,
      alt: alt,
      className: `transition-opacity duration-300 ${
        imageLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`,
      onLoad: handleLoad,
      onError: handleError,
      loading: 'lazy'
    })
  ].filter(Boolean));
};

interface PreloadImageOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export const useImagePreloader = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback(
    (src: string, options: PreloadImageOptions = {}): Promise<void> => {
      const { priority = 'low', crossOrigin } = options;

      if (loadedImages.has(src)) {
        return Promise.resolve();
      }

      if (loadingImages.has(src)) {
        // Return existing promise if already loading
        return new Promise((resolve) => {
          const checkLoaded = () => {
            if (loadedImages.has(src)) {
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        });
      }

      setLoadingImages(prev => new Set(prev).add(src));

      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src));
          setLoadingImages(prev => {
            const next = new Set(prev);
            next.delete(src);
            return next;
          });
          resolve();
        };

        img.onerror = () => {
          setLoadingImages(prev => {
            const next = new Set(prev);
            next.delete(src);
            return next;
          });
          reject(new Error(`Failed to preload image: ${src}`));
        };

        if (crossOrigin) {
          img.crossOrigin = crossOrigin;
        }

        // Set priority hint if supported
        if ('loading' in img && priority === 'high') {
          (img as any).loading = 'eager';
        }

        img.src = src;
      });
    },
    [loadedImages, loadingImages]
  );

  const preloadImages = useCallback(
    (sources: string[], options?: PreloadImageOptions): Promise<void[]> => {
      return Promise.all(sources.map(src => preloadImage(src, options)));
    },
    [preloadImage]
  );

  const isImageLoaded = useCallback(
    (src: string): boolean => loadedImages.has(src),
    [loadedImages]
  );

  const isImageLoading = useCallback(
    (src: string): boolean => loadingImages.has(src),
    [loadingImages]
  );

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageLoading,
    loadedCount: loadedImages.size,
    loadingCount: loadingImages.size
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<{
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
  }>({});

  useEffect(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  const getPerformanceScore = useCallback(() => {
    const { fcp, lcp, fid, cls } = metrics;
    let score = 100;

    // Scoring based on Core Web Vitals thresholds
    if (fcp && fcp > 1800) score -= 20;
    if (lcp && lcp > 2500) score -= 30;
    if (fid && fid > 100) score -= 25;
    if (cls && cls > 0.1) score -= 25;

    return Math.max(0, score);
  }, [metrics]);

  return {
    metrics,
    performanceScore: getPerformanceScore()
  };
};