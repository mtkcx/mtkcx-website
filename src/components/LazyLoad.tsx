import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  className = '',
  placeholder,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          setHasLoaded(true);
          observer.unobserve(element);
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
  }, [threshold, rootMargin, hasLoaded]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
    >
      {isIntersecting ? (
        children
      ) : (
        placeholder || (
          <Skeleton 
            className="w-full h-full" 
            style={{ height: typeof height === 'number' ? `${height}px` : height }}
          />
        )
      )}
    </div>
  );
};

export default LazyLoad;