import React, { useState, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Memoize image source to prevent unnecessary re-renders
  const memoizedSrc = useMemo(() => src, [src]);

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
      {isLoading && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Image unavailable</div>
        </div>
      ) : (
        <img
          src={memoizedSrc}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className={`w-full h-full object-cover gpu-accelerated transition-opacity duration-200 will-change-opacity ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ResponsiveImage;