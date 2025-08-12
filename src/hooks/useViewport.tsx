import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

interface ViewportInfo extends ViewportSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const getBreakpoint = (width: number): ViewportInfo['breakpoint'] => {
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
};

export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Use ResizeObserver if available for better performance
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize, { passive: true });
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = viewport.width < 768;
  const isTablet = viewport.width >= 768 && viewport.width < 1024;
  const isDesktop = viewport.width >= 1024;
  const isSmallScreen = viewport.width < 640;
  const breakpoint = getBreakpoint(viewport.width);

  return {
    ...viewport,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    breakpoint,
  };
};

export default useViewport;