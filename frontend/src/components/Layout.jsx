import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileHeader from './MobileHeader';
import Footer from './Footer';

const Layout = () => {
  const headerWrapRef = useRef(null);
  const mobileHeaderRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      let totalHeight = 0;
      if (headerWrapRef.current) {
        const navHeight = headerWrapRef.current.offsetHeight;
        setNavbarHeight(navHeight);
        totalHeight += navHeight;
      }
      // Only add mobile header height if it's visible (mobile view)
      if (mobileHeaderRef.current && window.innerWidth < 768) {
        totalHeight += mobileHeaderRef.current.offsetHeight;
      }
      setHeaderHeight(totalHeight);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    // Use MutationObserver to detect dynamic height changes
    const observer = new MutationObserver(updateHeight);
    if (headerWrapRef.current) {
      observer.observe(headerWrapRef.current, { childList: true, subtree: true, attributes: true });
    }
    if (mobileHeaderRef.current) {
      observer.observe(mobileHeaderRef.current, { childList: true, subtree: true, attributes: true });
    }
    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ '--app-header-height': `${headerHeight}px` }}>
      {/* Navbar - Fixed at top */}
      <div ref={headerWrapRef} className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Navbar />
      </div>

      {/* Mobile Header - Fixed below Navbar, only visible on mobile */}
      <div 
        ref={mobileHeaderRef} 
        className="fixed md:hidden left-0 right-0 z-[60]"
        style={{ top: `${navbarHeight}px` }}
      >
        <MobileHeader />
      </div>

      {/* Spacer equal to header height to avoid overlap */}
      <div aria-hidden="true" style={{ height: headerHeight }} className="bg-white border-b border-gray-300" />

      {/* Main Content Area with responsive padding */}
      <main className="flex-grow" style={{ position: 'relative' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
