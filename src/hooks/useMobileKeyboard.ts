import { useEffect, useState } from 'react';

export const useMobileKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Only run on mobile devices
    if (typeof window === 'undefined' || window.innerWidth > 768) return;

    let initialViewportHeight = window.innerHeight;
    let currentViewportHeight = window.innerHeight;

    const handleResize = () => {
      currentViewportHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentViewportHeight;
      
      // If the viewport height decreased by more than 150px, assume keyboard is open
      setIsKeyboardOpen(heightDifference > 150);
    };

    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const heightDifference = window.innerHeight - window.visualViewport.height;
        setIsKeyboardOpen(heightDifference > 150);
      }
    };

    // Listen for viewport changes
    window.addEventListener('resize', handleResize);
    
    // Use visual viewport API if available (more reliable for keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, []);

  return isKeyboardOpen;
};