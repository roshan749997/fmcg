import { useState, useEffect } from 'react';

/**
 * Hook to get the header background color based on banner index and screen size
 * Same logic as Navbar component
 */
export const useHeaderColor = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for banner changes
  useEffect(() => {
    const handleBannerChange = (event) => {
      setBannerIndex(event.detail.index);
    };

    window.addEventListener('bannerChanged', handleBannerChange);
    return () => window.removeEventListener('bannerChanged', handleBannerChange);
  }, []);

  // Get background color based on active banner and screen size
  const getHeaderBackgroundColor = () => {
    // Mobile view: Always use Lightorange
    if (isMobile) {
      return '#e7dacf'; // Lightorange
    }
    
    // Desktop view: Based on banner index
    // First banner (index 0): Lightyellow
    // Second banner (index 1): Greyturquoise
    if (bannerIndex === 0) {
      return '#efecd8'; // Lightyellow
    } else if (bannerIndex === 1) {
      return '#79b4a1'; // Greyturquoise
    }
    return '#FFFFFF'; // Default white
  };

  return getHeaderBackgroundColor();
};







