import { useState, useEffect, useCallback } from 'react';

interface HapticOptions {
  type?: 'light' | 'medium' | 'heavy' | 'selection';
  duration?: number;
}

interface PullToRefreshOptions {
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
}

// Haptic Feedback Hook
export const useHaptics = () => {
  const triggerHaptic = useCallback((options: HapticOptions = {}) => {
    const { type = 'light' } = options;
    
    // Check if device supports haptics
    if ('navigator' in window && 'vibrate' in navigator) {
      // Fallback to vibration for devices without haptic feedback
      const vibrationPatterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        selection: [5]
      };
      
      navigator.vibrate(vibrationPatterns[type]);
    }
    
    // For iOS Safari with haptic feedback support
    if ('DeviceMotionEvent' in window && typeof (window as any).DeviceMotionEvent.requestPermission === 'function') {
      // Use iOS haptic feedback if available
      try {
        const duration = options.duration || 10;
        // This would work on iOS devices with proper haptic support
        (window as any).navigator?.vibrate?.(duration);
      } catch (error) {
        console.log('Haptic feedback not supported');
      }
    }
  }, []);

  const impact = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    triggerHaptic({ type: intensity });
  }, [triggerHaptic]);

  const selection = useCallback(() => {
    triggerHaptic({ type: 'selection' });
  }, [triggerHaptic]);

  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    const vibrationMap = {
      success: [10, 10, 10],
      warning: [20, 20],
      error: [50, 100, 50]
    };
    
    if ('navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(vibrationMap[type]);
    }
  }, []);

  return {
    triggerHaptic,
    impact,
    selection,
    notification
  };
};

// Pull to Refresh Hook
export const usePullToRefresh = (
  onRefresh: () => Promise<void> | void,
  options: PullToRefreshOptions = {}
) => {
  const {
    threshold = 80,
    resistance = 2,
    enabled = true
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
    setCanPull(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !canPull || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY) / resistance);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [enabled, canPull, startY, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !canPull) return;
    
    setCanPull(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [enabled, canPull, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const refreshIndicatorStyle = {
    transform: `translateY(${pullDistance}px)`,
    opacity: Math.min(1, pullDistance / threshold)
  };

  return {
    isRefreshing,
    pullDistance,
    refreshIndicatorStyle,
    isTriggered: pullDistance >= threshold
  };
};

// Swipe Gesture Hook
export const useSwipeGesture = (
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
  options: SwipeGestureOptions = {}
) => {
  const {
    threshold = 50,
    velocity = 0.3,
    direction = 'horizontal'
  } = options;

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setStartTime(Date.now());
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const endPos = { x: touch.clientX, y: touch.clientY };
    const endTime = Date.now();
    
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const deltaTime = endTime - startTime;
    
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;
    
    // Check if swipe meets minimum requirements
    if ((velocityX < velocity && velocityY < velocity) || deltaTime > 1000) return;
    
    // Determine swipe direction
    if (direction === 'horizontal' || direction === 'both') {
      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        onSwipe(deltaX > 0 ? 'right' : 'left');
        return;
      }
    }
    
    if (direction === 'vertical' || direction === 'both') {
      if (Math.abs(deltaY) > threshold && Math.abs(deltaY) > Math.abs(deltaX)) {
        onSwipe(deltaY > 0 ? 'down' : 'up');
        return;
      }
    }
  }, [startPos, startTime, threshold, velocity, direction, onSwipe]);

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };

  return swipeHandlers;
};

// Native Share Hook
export const useNativeShare = () => {
  const canShare = useCallback((data?: ShareData) => {
    return 'share' in navigator && (!data || navigator.canShare?.(data));
  }, []);

  const share = useCallback(async (data: ShareData) => {
    if (!canShare(data)) {
      throw new Error('Web Share API not supported or data not shareable');
    }
    
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled the share
        return false;
      }
      throw error;
    }
  }, [canShare]);

  const shareText = useCallback(async (text: string, title?: string) => {
    return share({ text, title });
  }, [share]);

  const shareUrl = useCallback(async (url: string, title?: string, text?: string) => {
    return share({ url, title, text });
  }, [share]);

  const shareProduct = useCallback(async (product: {
    name: string;
    description?: string;
    image?: string;
    url?: string;
  }) => {
    const shareData: ShareData = {
      title: product.name,
      text: product.description || `Check out ${product.name}`,
      url: product.url || window.location.href
    };

    return share(shareData);
  }, [share]);

  return {
    canShare,
    share,
    shareText,
    shareUrl,
    shareProduct
  };
};