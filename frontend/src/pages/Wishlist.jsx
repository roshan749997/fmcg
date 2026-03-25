import React from 'react';
import { FaHeart, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { placeholders } from '../utils/imagePlaceholder';

const Wishlist = () => {
  const {
    wishlistItems,
    wishlistLoading,
    wishlistError,
    removeFromWishlist,
    isTogglingWishlist,
  } = useWishlist();

  if (wishlistLoading && wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-black font-medium">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-lg text-center">
          <h2 className="text-xl font-bold text-black mb-2">Could not load wishlist</h2>
          <p className="text-black/80">{wishlistError}</p>
        </div>
      </div>
    );
  }

  if (!wishlistItems.length) {
    return (
      <div className="min-h-[60vh] bg-white px-4">
        <div className="max-w-6xl mx-auto py-10 text-center">
          <img src={placeholders.wishlist} alt="Wishlist empty" className="w-full max-w-md mx-auto mb-6 object-contain" />
          <h2 className="text-2xl font-bold text-black mb-2">Your wishlist is empty</h2>
          <p className="text-black/70 mb-6">
            Tap the heart on a product to save it here for later.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-[#fb641b] hover:opacity-95 transition-opacity"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Wishlist</h1>
            <p className="text-black/70 text-sm mt-1">{wishlistItems.length} saved item(s)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {wishlistItems.map((item) => {
            const removing = isTogglingWishlist(item.id);
            return (
              <div key={item.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[3/4] bg-gray-50 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholders.productList;
                    }}
                  />
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-black line-clamp-2">
                      {item.name}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={removing}
                      aria-label="Remove from wishlist"
                      className={`shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full border transition-all ${
                        removing
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-pink-50 border-pink-100 text-[#E91E63] hover:bg-pink-100'
                      }`}
                    >
                      {removing ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaHeart className="text-lg" />
                      )}
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-black">₹{Math.round(item.price || 0).toLocaleString()}</span>
                      {item.originalPrice > item.price && item.originalPrice > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{Math.round(item.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link
                      to={`/product/${item.id}`}
                      className="inline-flex w-full justify-center items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-95 transition-opacity"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

