import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

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

const WishlistIcon = ({ isActive }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isActive ? '#000000' : 'none'} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="#000000"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MobileBottomNav = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
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
      style={{ backgroundColor: '#FFFFFF' }}
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
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/') ? 'text-[#5c9404]' : 'text-gray-700'}`}>HOME</span>
        </a>
        
        <Link 
          to="/wishlist" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 relative ${isActive('/wishlist') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <WishlistIcon isActive={isActive('/wishlist')} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#5c9404] to-[#8B2BE2] text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-md border border-white">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/wishlist') ? 'text-[#5c9404]' : 'text-gray-700'}`}>WISHLIST</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 relative group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 relative ${isActive('/cart') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <CartIcon isActive={isActive('/cart')} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#5c9404] to-[#8B2BE2] text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center shadow-md border border-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/cart') ? 'text-[#5c9404]' : 'text-gray-700'}`}>CART</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 group`}
        >
          <div className={`p-2 rounded-full transition-all duration-300 ${isActive('/profile') ? 'bg-pink-100 shadow-md scale-110' : 'group-hover:bg-pink-50 group-hover:scale-105'}`}>
            <AccountIcon isActive={isActive('/profile')} />
          </div>
          <span className={`text-[8px] mt-0.5 font-semibold transition-colors ${isActive('/profile') ? 'text-[#5c9404]' : 'text-gray-700'}`}>ACCOUNT</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
