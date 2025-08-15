// Performance optimization utilities

// Debounce function for scroll events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (srcs: string[]): Promise<void> => {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Enhanced font loading with fallback
export const loadFont = (fontFamily: string, src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ('fonts' in document && document.fonts) {
      const font = new FontFace(fontFamily, `url(${src})`);
      font.load().then(() => {
        document.fonts.add(font);
        resolve();
      }).catch(reject);
    } else {
      // Fallback for older browsers
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load font'));
      document.head.appendChild(link);
    }
  });
};

// Optimize image loading with responsive sizes
export const getOptimizedImageSrc = (
  baseSrc: string,
  width: number,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string => {
  // This would work with a CDN that supports dynamic resizing
  // For now, return the base src
  return baseSrc;
};

// Check if device supports WebP
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Memory-efficient array chunking for large lists
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Intersection Observer factory with common options
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLinks = Array.from(document.querySelectorAll('link[rel="preload"][as="font"]'));
  
  // Preload hero images
  const heroImages = [
    '/lovable-uploads/3f627a82-3732-49c8-9927-8736394acebc.png',
    '/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png'
  ];
  
  preloadImages(heroImages);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful');
      return registration;
    } catch (error) {
      console.log('ServiceWorker registration failed');
      return null;
    }
  }
  return null;
};