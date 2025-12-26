import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaRupeeSign } from 'react-icons/fa';
import { placeholders, getProductImage } from '../utils/imagePlaceholder';
import { getWishlist, removeFromWishlist } from '../services/api';
import ScrollToTop from '../components/ScrollToTop';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      // Extract products from wishlist items
      const products = (data.items || []).map(item => item.product).filter(Boolean);
      setItems(products);
      
      // Dispatch event for other components (like Navbar)
      try { window.dispatchEvent(new Event('wishlist:updated')); } catch {}
    } catch (err) {
      console.error('Error loading wishlist:', err);
      // Don't show error if user is just not logged in (401)
      if (err.message && err.message.includes('401')) {
        setItems([]);
        setError(null); // Don't show error for unauthenticated users
      } else {
        setError(err.message || 'Failed to load wishlist');
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (id) => {
    try {
      await removeFromWishlist(id);
      // Reload wishlist to get updated data
      await loadWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF1493] mb-4"></div>
        <p className="text-gray-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (error && !items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="mb-6">
          <svg className="mx-auto h-24 w-24 text-red-200 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Unable to Load Wishlist</h2>
        <p className="text-gray-600 mb-6 text-base">{error}</p>
        <button
          className="px-6 py-3 text-black rounded-xl border-2 border-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          style={{ backgroundColor: '#FFD1DC' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#FFB6C1'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD1DC'}
          onClick={loadWishlist}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="mb-6">
          <svg className="mx-auto h-24 w-24 text-pink-200 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h2>
        <p className="text-gray-600 mb-6 text-base">Tap the heart on any product to save it here.</p>
        <button
          className="px-6 py-3 text-black rounded-xl border-2 border-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          style={{ backgroundColor: '#FFD1DC' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#FFB6C1'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD1DC'}
          onClick={() => navigate('/')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col items-center text-center mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Wishlist</h1>
            <div className="w-32 h-1.5 bg-gradient-to-r from-[#FF1493] via-[#8B2BE2] to-[#FF1493] rounded-full shadow-sm"></div>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {items.map((p) => (
            <div key={p._id} className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2">
              <div
                className="relative w-full pt-[125%] bg-gray-50 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                <img
                  src={getProductImage(p, 'image1')}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholders.wishlist;
                  }}
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="p-4 sm:p-5 bg-white">
                {/* Gradient accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1493] via-[#8B2BE2] to-[#FF1493] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 min-h-[3rem] mb-2 group-hover:text-[#FF1493] transition-colors">{p.title}</h3>
                <div className="flex items-center gap-2 mt-3 mb-4">
                  <div className="flex items-center text-gray-900">
                    <FaRupeeSign className="w-4 h-4 text-gray-900" />
                    <span className="text-lg sm:text-xl font-bold ml-0.5">{p.price?.toLocaleString?.() || p.sellingPrice?.toLocaleString?.() || ''}</span>
                  </div>
                  {p.mrp && (
                    <span className="text-sm text-gray-400 line-through">₹{p.mrp.toLocaleString?.()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button
                    className="text-sm font-semibold text-[#FF1493] hover:text-[#E01282] transition-colors"
                    onClick={() => navigate(`/product/${p._id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    onClick={() => removeItem(p._id)}
                    title="Remove"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Wishlist;
