import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { searchProducts } from '../services/api';
import { placeholders, getProductImage } from '../utils/imagePlaceholder';
import { navbarCategories } from '../data/categoryTree';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const searchWrapRefDesktop = useRef(null);
  const categoryRef = useRef(null);
  const hoverCloseTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userInitial, setUserInitial] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [headerLogo, setHeaderLogo] = useState({
    url: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765607037/Pink_and_Purple_Playful_Kids_Store_Logo_150_x_60_px_1_ex8w7m.svg',
    alt: 'Kidzo',
    width: 'auto',
    height: 'auto',
  });

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const { api } = await import('../utils/api');
        const logo = await api.getLogo('header').catch(() => null);
        if (logo) {
          setHeaderLogo({ 
            url: logo.url, 
            alt: logo.alt || 'Kidzo',
            width: logo.width || 'auto',
            height: logo.height || 'auto',
          });
        }
      } catch (err) {
        console.error('Failed to load header logo:', err);
      }
    };
    loadLogo();

    // Listen for logo updates
    const handleLogoUpdate = (event) => {
      if (event.detail.type === 'header') {
        loadLogo();
      }
    };
    window.addEventListener('logo:updated', handleLogoUpdate);
    return () => window.removeEventListener('logo:updated', handleLogoUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadWishlistCount = async () => {
      try {
        const { getWishlistCount } = await import('../services/api');
        const data = await getWishlistCount();
        setWishlistCount(data.count || 0);
      } catch {
        setWishlistCount(0);
      }
    };
    
    loadWishlistCount();
    
    // Listen for wishlist updates (from custom event)
    const onWishlistUpdated = () => {
      loadWishlistCount();
    };
    
    window.addEventListener('wishlist:updated', onWishlistUpdated);
    return () => {
      window.removeEventListener('wishlist:updated', onWishlistUpdated);
    };
  }, []);

  // Check authentication status and get user initial
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const authenticated = Boolean(token);
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          // Try to get user data from localStorage or API
          try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
              const parsed = JSON.parse(userData);
              const name = parsed.name || parsed.user?.name || '';
              const email = parsed.email || parsed.user?.email || '';
              const avatar = parsed.avatar || parsed.user?.avatar || '';
              const initial = name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : 'U');
              setUserInitial(initial);
              setUserAvatar(avatar);
              setAvatarError(false);
            } else {
              // Try to fetch from API
              try {
                const { api } = await import('../utils/api');
                const data = await api.me();
                const userName = data?.user?.name || '';
                const userEmail = data?.user?.email || '';
                const userAvatar = data?.user?.avatar || '';
                const initial = userName ? userName.charAt(0).toUpperCase() : (userEmail ? userEmail.charAt(0).toUpperCase() : 'U');
                setUserInitial(initial);
                setUserAvatar(userAvatar);
                setAvatarError(false);
              } catch {
                setUserInitial('U');
                setUserAvatar('');
                setAvatarError(false);
              }
            }
          } catch {
            setUserInitial('U');
            setUserAvatar('');
            setAvatarError(false);
          }
        } else {
          setUserInitial('');
          setUserAvatar('');
          setAvatarError(false);
        }
      } catch {
        setIsAuthenticated(false);
        setUserInitial('');
      }
    };

    checkAuth();
    
    // Listen for storage events (from other tabs/windows)
    const onStorage = (e) => {
      if (!e || e.key === 'auth_token' || e.key === 'user_data') {
        checkAuth();
      }
    };
    
    // Listen for custom auth state change events (from same window)
    const onAuthStateChanged = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('authStateChanged', onAuthStateChanged);
    
    // Listen for profile picture updates
    const onProfilePictureUpdated = () => {
      checkAuth();
    };
    window.addEventListener('profilePictureUpdated', onProfilePictureUpdated);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authStateChanged', onAuthStateChanged);
      window.removeEventListener('profilePictureUpdated', onProfilePictureUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookies
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include', // Include cookies
        });
      } catch (err) {
        console.error('Logout API error:', err);
        // Continue with local logout even if API fails
      }
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_is_admin');
      localStorage.removeItem('user_data');
      
      // Update state
      setIsAuthenticated(false);
      setUserInitial('');
      setUserAvatar('');
      setAvatarError(false);
      
      // Dispatch events to notify other components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: false } }));
      
      // Navigate to sign in
      navigate('/signin');
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback: clear local storage and navigate
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_is_admin');
        localStorage.removeItem('user_data');
      } catch {
        // Ignore localStorage cleanup errors
      }
      setIsAuthenticated(false);
      setUserInitial('');
      setUserAvatar('');
      setAvatarError(false);
      navigate('/signin');
    }
  };

  const handleLogin = () => {
    navigate('/signin', { state: { backgroundLocation: location } });
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  // Debounced fetch for inline search results
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      // Don't close the dropdown if it's already open - let user continue typing
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchProducts(q);
        const items = data?.results || [];
        setSearchResults(items);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      const inDesktop = searchWrapRefDesktop.current && searchWrapRefDesktop.current.contains(e.target);
      if (!inDesktop) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Categories with subcategories
  const categories = navbarCategories;
  const hideCategoryChevron = new Set([
    'Beauty & Hygiene',
    'Beverages',
    'Cleaning & Household',
    'Snacks & Branded Foods',
  ]);
  const hoverOpensDropdown = new Set([
    'Beauty & Hygiene',
    'Beverages',
    'Cleaning & Household',
    'Snacks & Branded Foods',
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on a link
      if (event.target.tagName === 'A' || event.target.closest('a')) {
        return;
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`relative z-[70] w-full bg-white border-b border-gray-200 transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
      {/* Bottom Bar - Clean white background with Logo, Navigation, and Icons */}
      <div className="w-full">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-4 2xl:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo/Brand - Left */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src={headerLogo.url}
                alt={headerLogo.alt}
                style={{
                  ...(headerLogo.width !== 'auto' && { width: headerLogo.width }),
                  ...(headerLogo.height !== 'auto' && { height: headerLogo.height }),
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
                className={headerLogo.width === 'auto' && headerLogo.height === 'auto' 
                  ? "h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain" 
                  : "object-contain"}
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765607037/Pink_and_Purple_Playful_Kids_Store_Logo_150_x_60_px_1_ex8w7m.svg';
                }}
              />
            </Link>

            {/* Navigation Menu - Center (Desktop) with Categories */}
            <div className="hidden md:flex items-center justify-center flex-1 space-x-3 lg:space-x-5" ref={categoryRef}>
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => {
                  if (hoverCloseTimeoutRef.current) {
                    clearTimeout(hoverCloseTimeoutRef.current);
                    hoverCloseTimeoutRef.current = null;
                  }
                    if (
                      hoverOpensDropdown.has(category.name) &&
                      category.subcategories &&
                      category.subcategories.length > 0
                    ) {
                      setActiveCategory(category.name);
                    }
                  }}
                onMouseLeave={() => {
                  if (!hoverOpensDropdown.has(category.name)) return;

                  // Small delay prevents closing while moving from the trigger
                  // into the absolutely-positioned dropdown panel.
                  hoverCloseTimeoutRef.current = setTimeout(() => {
                    setActiveCategory((prev) => (prev === category.name ? null : prev));
                  }, 120);
                }}
                >
                  <div
                    className={`flex items-center font-semibold text-[11px] sm:text-sm tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-50 active:bg-gray-100 touch-manipulation text-black ${
                      activeCategory === category.name ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => {
                      // If category has subcategories, toggle dropdown; otherwise navigate directly
                      if (category.subcategories && category.subcategories.length > 0) {
                        setActiveCategory(activeCategory === category.name ? null : category.name);
                      } else {
                        navigate(category.path);
                      }
                    }}
                  >
                    <span className="whitespace-nowrap">{category.name}</span>
                    {category.subcategories &&
                      category.subcategories.length > 0 &&
                      !hideCategoryChevron.has(category.name) && (
                        <svg
                          className={`w-4 h-4 ml-1.5 flex-shrink-0 transition-transform duration-300 ${
                            activeCategory === category.name ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                  </div>

                  {/* Simple Attractive Dropdown */}
                  {activeCategory === category.name && category.subcategories && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 sm:mt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-200 border border-gray-100 overflow-hidden w-56 sm:w-64 min-w-[200px] sm:min-w-[220px]">
                        {/* Header */}
                        <div className="bg-gray-50 border-b border-gray-200">
                          <button
                            type="button"
                            className="w-full text-left block px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-colors duration-150 flex items-center gap-2 group touch-manipulation active:bg-gray-100 hover:bg-gray-100 text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveCategory(null);
                              navigate(category.path);
                            }}
                          >
                            <span className="tracking-wide">All {category.name}</span>
                          </button>
                        </div>
                        
                        {/* Subcategories */}
                        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar py-1 sm:py-2 divide-y divide-gray-100">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.name}
                              type="button"
                              className="w-full text-left flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 sm:py-3 text-sm transition-colors duration-150 hover:bg-gray-50 active:bg-gray-100 group touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveCategory(null);
                                navigate(subcategory.path);
                              }}
                            >
                              <span
                                className="font-medium text-gray-900"
                              >
                                {subcategory.name}
                              </span>
                              <svg
                                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-400 group-hover:text-gray-600 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Icons - Right (Search, Cart on Mobile; All icons on Desktop) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 ml-auto md:ml-0">
              {/* Search Icon - Always Visible */}
              <div className="relative" ref={searchWrapRefDesktop}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-1.5 sm:p-2 md:p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-900 transition-colors duration-150 group touch-manipulation border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Search"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
                {/* Search Dropdown */}
                {searchOpen && (
                  <div className="fixed md:absolute right-2 sm:right-4 md:right-0 left-2 sm:left-4 md:left-auto top-[calc(var(--app-header-height,48px)+0.5rem)] sm:top-[calc(var(--app-header-height,56px)+0.5rem)] md:top-full mt-0 md:mt-2 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[80]">
                    <div className="p-2 sm:p-3">
                      <input
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => { const v = e.target.value; setSearchQuery(v); }}
                        onKeyPress={handleSearchKeyPress}
                        className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black placeholder-gray-500"
                        autoFocus
                      />
                    </div>
                    {searchLoading && (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-black">Searching…</div>
                    )}
                    {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-black">No products found</div>
                    )}
                    {!searchLoading && searchResults.length > 0 && (
                      <ul className="max-h-[60vh] sm:max-h-80 overflow-auto divide-y divide-gray-100">
                        {searchResults.slice(0, 8).map((p) => (
                          <li key={p._id || p.id || p.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                navigate(`/product/${p._id || p.id || ''}`);
                              }}
                              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 active:bg-gray-100 text-left touch-manipulation"
                            >
                              <img
                                src={getProductImage(p, 'image1') || p.image || placeholders.thumbnail}
                                alt={p.title || p.name || 'Product'}
                                className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded-md border border-gray-100 flex-shrink-0"
                                onError={(e) => { e.target.onerror = null; e.target.src = placeholders.thumbnail; }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-black truncate">{p.title || p.name || 'Product'}</p>
                                {p.price && (
                                  <p className="text-[10px] sm:text-xs text-black">₹{Number(p.price).toLocaleString()}</p>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Icon - Hidden on Mobile, Visible on Desktop */}
              <Link to="/wishlist" className="hidden md:flex p-1.5 sm:p-2 md:p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-900 relative transition-colors duration-150 group touch-manipulation border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-black text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-lg border border-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon - Always Visible */}
              <Link to="/cart" className="p-1.5 sm:p-2 md:p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-900 relative transition-colors duration-150 group touch-manipulation border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75H5.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zm6.75 0a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-black text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-lg border border-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Icon - Always Visible */}
              <NavLink
                to="/wishlist"
                className="p-1.5 sm:p-2 md:p-2.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 hover:text-pink-700 relative transition-all duration-200 hover:scale-110 group touch-manipulation"
              >
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#5c9404] to-[#8B2BE2] text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-lg border border-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </NavLink>

              {/* My Account Icon / User Profile Picture - Hidden on Mobile, Visible on Desktop */}
              {isAuthenticated && userInitial ? (
                <Link 
                  to="/profile" 
                  className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-900 text-white font-bold text-sm sm:text-base md:text-lg items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-150 group touch-manipulation ring-1 ring-gray-200 hover:ring-gray-300 overflow-hidden border border-gray-200"
                  title="My Profile"
                >
                  {userAvatar && !avatarError ? (
                    <img 
                      src={userAvatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </Link>
              ) : (
                <button 
                  onClick={handleLogin} 
                  className="hidden md:flex p-1.5 sm:p-2 md:p-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-900 transition-colors duration-150 group touch-manipulation items-center justify-center border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Sign In"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-1">
              <button
                onClick={() => {
                  const next = !isMobileMenuOpen;
                  setIsMobileMenuOpen(next);
                  if (!next) setMobileCategoryOpen(null);
                }}
                className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-black focus:outline-none touch-manipulation active:bg-gray-100"
                aria-expanded="false"
                aria-label="Toggle menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 sm:py-6 border-t border-gray-200 bg-white shadow-lg relative z-[70] max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {/* Mobile Navigation Links - Grid */}
            <nav className="px-3 sm:px-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Link
                  to="/"
                  className="bg-white border border-gray-300 rounded-lg py-4 sm:py-5 px-3 sm:px-4 text-center font-bold text-xs sm:text-sm uppercase text-black hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation shadow-sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setMobileCategoryOpen(null);
                    window.scrollTo(0, 0);
                  }}
                >
                  HOME
                </Link>
                <Link
                  to="/about"
                  className="bg-white border border-gray-300 rounded-lg py-4 sm:py-5 px-3 sm:px-4 text-center font-bold text-xs sm:text-sm uppercase text-black hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation shadow-sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setMobileCategoryOpen(null);
                    window.scrollTo(0, 0);
                  }}
                >
                  ABOUT
                </Link>
                <Link
                  to="/contact"
                  className="bg-white border border-gray-300 rounded-lg py-4 sm:py-5 px-3 sm:px-4 text-center font-bold text-xs sm:text-sm uppercase text-black hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation shadow-sm col-span-2"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setMobileCategoryOpen(null);
                    window.scrollTo(0, 0);
                  }}
                >
                  CONTACT
                </Link>
              </div>
            </nav>

            {/* Mobile Categories Accordion */}
            <div className="mt-4 px-3 sm:px-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Shop by Category
                </h3>
              </div>

              <div className="space-y-2">
                {categories.map((category) => {
                  const isOpen = mobileCategoryOpen === category.name;
                  const hasSub = category.subcategories && category.subcategories.length > 0;

                  return (
                    <div key={category.name} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasSub) {
                            navigate(category.path);
                            setIsMobileMenuOpen(false);
                            setMobileCategoryOpen(null);
                            window.scrollTo(0, 0);
                            return;
                          }
                          setMobileCategoryOpen(isOpen ? null : category.name);
                        }}
                        className="w-full px-3 sm:px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 active:bg-gray-100"
                      >
                        <span className="font-bold text-sm sm:text-base text-gray-900 uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                          {category.name}
                        </span>

                        {hasSub && (
                          <svg
                            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 text-gray-700 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {isOpen && hasSub && (
                        <div className="bg-white border-t border-gray-100">
                          <div className="py-2 max-h-64 overflow-y-auto custom-scrollbar">
                            <div className="space-y-1.5 px-2 sm:px-3">
                              {category.subcategories.map((subcategory) => (
                                <button
                                  key={subcategory.name}
                                  type="button"
                                  onClick={() => {
                                    navigate(subcategory.path);
                                    setIsMobileMenuOpen(false);
                                    setMobileCategoryOpen(null);
                                    window.scrollTo(0, 0);
                                  }}
                                  className="w-full text-left px-2 py-2 rounded-md hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                                >
                                  <span className="text-sm text-gray-900">
                                    {subcategory.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Icons Section */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 px-3 sm:px-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Wishlist - Mobile Only */}
                <Link
                  to="/wishlist"
                  className="bg-white border border-gray-300 rounded-lg py-3 sm:py-4 px-3 sm:px-4 flex items-center justify-center space-x-2 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation shadow-sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setMobileCategoryOpen(null);
                  }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span className="font-bold text-xs sm:text-sm text-black">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-black text-white text-[10px] sm:text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Profile - Mobile Only */}
                {isAuthenticated && userInitial ? (
                  <Link
                    to="/profile"
                    className="bg-white border border-gray-300 rounded-lg py-3 sm:py-4 px-3 sm:px-4 flex items-center justify-center space-x-2 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation shadow-sm"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMobileCategoryOpen(null);
                    }}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white font-bold text-sm sm:text-base flex items-center justify-center overflow-hidden">
                      {userAvatar && !avatarError ? (
                        <img 
                          src={userAvatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-black">Profile</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                      setMobileCategoryOpen(null);
                    }}
                    className="bg-white border border-gray-300 rounded-lg py-3 sm:py-4 px-3 sm:px-4 flex items-center justify-center space-x-2 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-manipulation shadow-sm"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="font-bold text-xs sm:text-sm text-black">Sign In</span>
                  </button>
                )}
              </div>
            </div>

            {/* Auth Section in Mobile Menu */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 px-3 sm:px-4 border-t border-gray-200">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                    setMobileCategoryOpen(null);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-3 sm:px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 active:bg-gray-900 transition-colors duration-200 touch-manipulation text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles for Dropdown */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;