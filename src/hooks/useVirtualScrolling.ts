import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualScrollingOptions {
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  threshold?: number;
}

export const useVirtualScrolling = <T>(
  items: T[],
  options: VirtualScrollingOptions = {}
) => {
  const {
    itemHeight = 300,
    containerHeight = window.innerHeight,
    overscan = 3,
    threshold = 0.8
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount;

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  // Check if we need to load more items
  const shouldLoadMore = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const scrollPercentage = (scrollTop + containerHeight) / totalHeight;
    return scrollPercentage >= threshold;
  }, [scrollTop, containerHeight, items.length, itemHeight, threshold]);

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    shouldLoadMore,
    isLoading,
    setIsLoading,
    handleScroll,
    visibleRange
  };
};