import React, { useState, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useImagePreloader } from '@/hooks/useImagePreloader';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  preload?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  aspectRatio = 'auto',
  loading = 'lazy',
  onLoad,
  onError,
  preload = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { createOptimizedImageUrl, isPreloaded } = useImagePreloader();

  // Preload critical images
  const preloadImage = useCallback((src: string) => {
    if (!preload || typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, [preload]);

  // Memoize optimized image source
  const memoizedSrc = useMemo(() => 
    createOptimizedImageUrl(src, { 
      priority: priority ? 'high' : 'low',
      quality: priority ? 90 : 80,
      format: 'auto'
    }), [src, priority, createOptimizedImageUrl]);

  // Check if image is already preloaded
  const isAlreadyPreloaded = useMemo(() => isPreloaded(src), [src, isPreloaded]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return '';
    }
  };

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Preload image if priority
  React.useEffect(() => {
    if (priority || preload) {
      preloadImage(memoizedSrc);
    }
  }, [memoizedSrc, priority, preload, preloadImage]);

  return (
    <div className={`relative overflow-hidden ${getAspectRatioClass()} ${className}`}>
      {isLoading && !hasError && !isAlreadyPreloaded && (
        <Skeleton className="absolute inset-0 w-full h-full bg-muted/20" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Image unavailable</div>
        </div>
      ) : (
        <picture>
          {/* WebP format for better compression */}
          <source 
            srcSet={memoizedSrc.replace(/\.(jpg|jpeg|png)/, '.webp')} 
            type="image/webp"
            sizes={sizes}
          />
          <img
            src={memoizedSrc}
            alt={alt}
            sizes={sizes}
            loading={priority ? 'eager' : loading}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className={`w-full h-full object-cover transition-all duration-300 ease-out will-change-transform ${
              isLoading && !isAlreadyPreloaded ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            style={{
              transform: isAlreadyPreloaded ? 'translateZ(0)' : undefined,
              backfaceVisibility: 'hidden',
              perspective: 1000
            }}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}
    </div>
  );
};

export default ResponsiveImage;