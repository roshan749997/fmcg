import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// SVG Icons with black color
const HomeIcon = ({ isActive }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const WishlistIcon = ({ isActive }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20.84 4.60999C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.49999C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12087 20.84 4.60999V4.60999Z"
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const CartIcon = ({ isActive }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="9" 
      cy="21" 
      r="1.5" 
      fill="#000000"
      stroke="#000000"
      strokeWidth="1.5"
    />
    <circle 
      cx="20" 
      cy="21" 
      r="1.5" 
      fill="#000000"
      stroke="#000000"
      strokeWidth="1.5"
    />
    <path 
      d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const AccountIcon = ({ isActive }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle 
      cx="12" 
      cy="7" 
      r="4" 
      stroke="#000000" 
      strokeWidth="2.5" 
      fill="none"
    />
    <path 
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke="#000000" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
  </svg>
);

const MobileBottomNav = () => {
  const { cartCount } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read wishlist count from localStorage
  useEffect(() => {
    const readWishlistCount = () => {
      try {
        const raw = localStorage.getItem('wishlist');
        const list = raw ? JSON.parse(raw) : [];
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    
    readWishlistCount();
    
    const onStorage = (e) => {
      if (!e || e.key === 'wishlist') {
        readWishlistCount();
      }
    };
    
    const onCustom = () => {
      readWishlistCount();
    };
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('wishlist:updated', onCustom);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wishlist:updated', onCustom);
    };
  }, []);

  // Detect footer visibility using Intersection Observer
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsFooterVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of footer is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before footer enters viewport
      }
    );
    
    observer.observe(footer);
    
    return () => {
      observer.disconnect();
    };
  }, [location.pathname]); // Re-run when route changes

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 shadow-lg border-t-2 border-pink-200 md:hidden z-50 pt-2 pb-1 transition-transform duration-300 ${
        isFooterVisible ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ backgroundColor: '#e7dacf' }}
    >
      <div className="flex justify-around items-center h-12">
        <a 
          href="/" 
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <HomeIcon isActive={isActive('/')} />
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/') ? 'text-[#FF1493]' : 'text-gray-700'}`}>HOME</span>
        </a>
        
        <Link 
          to="/wishlist" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 relative ${isActive('/wishlist') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <WishlistIcon isActive={isActive('/wishlist')} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FF1493] to-[#8B2BE2] text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-md border border-white">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/wishlist') ? 'text-[#FF1493]' : 'text-gray-700'}`}>WISHLIST</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 relative group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 relative ${isActive('/cart') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <CartIcon isActive={isActive('/cart')} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FF1493] to-[#8B2BE2] text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-md border border-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/cart') ? 'text-[#FF1493]' : 'text-gray-700'}`}>CART</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/profile') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <AccountIcon isActive={isActive('/profile')} />
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/profile') ? 'text-[#FF1493]' : 'text-gray-700'}`}>ACCOUNT</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
