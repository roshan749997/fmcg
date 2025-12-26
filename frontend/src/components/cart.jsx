import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { getProductImage, placeholders } from '../utils/imagePlaceholder';
import ScrollToTop from './ScrollToTop';
import { useHeaderColor } from '../utils/useHeaderColor';

function Cart() {
  const navigate = useNavigate();
  const headerColor = useHeaderColor();
  const { 
    cart = [], 
    updateQuantity, 
    removeFromCart, 
    cartTotal = 0, 
    cartCount = 0,
    clearCart 
  } = useCart();

  console.log('Cart component rendered with:', { cart, cartTotal, cartCount }); // Debug log
  
  // Debug: Log cart items structure
  useEffect(() => {
    if (cart.length > 0) {
      console.log('Cart items structure:', cart.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        images: item.images,
        hasImage: !!item.image,
        hasImages: !!item.images
      })));
    }
  }, [cart]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuantityChange = (itemId, newQuantity, size = null) => {
    if (newQuantity < 1) {
      removeFromCart(itemId, size);
    } else {
      updateQuantity(itemId, newQuantity, size);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-6xl">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-black mb-4 sm:mb-6 transition-all cursor-pointer border-2 border-black rounded-lg px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-semibold shadow-sm transform hover:scale-105 active:scale-95 w-full sm:w-auto"
          style={{ backgroundColor: headerColor }}
        >
          <FaArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Continue Shopping
        </button>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
          <span className="w-0.5 sm:w-1 h-6 sm:h-8 md:h-10 bg-gradient-to-b from-[#FF1493] to-[#8B2BE2] rounded-full"></span>
          <span className="break-words">Your Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
        </h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-pink-200 px-4 sm:px-6">
          <FaShoppingCart className="mx-auto text-4xl sm:text-5xl md:text-6xl text-pink-300 mb-4 sm:mb-6" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg px-2">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl border-2 border-black transition-all font-semibold shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
            style={{ backgroundColor: headerColor }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
             {cart.map((item) => {
               // Debug logging
               console.log('Cart item rendering:', {
                 id: item.id,
                 name: item.name,
                 image: item.image,
                 imageType: typeof item.image,
                 hasImage: !!item.image
               });
               
               // Get image URL - handle both string URL and object format
               let imageUrl = placeholders.productList;
               if (item.image) {
                 if (typeof item.image === 'string' && item.image.trim() !== '') {
                   // Direct URL string
                   imageUrl = item.image.trim();
                 } else if (typeof item.image === 'object') {
                   // Object format - use getProductImage
                   imageUrl = getProductImage({ images: item.image }, 'image1') || placeholders.productList;
                 } else {
                   // Try getProductImage as fallback
                   imageUrl = getProductImage({ images: { image1: item.image } }, 'image1') || placeholders.productList;
                 }
               }
               
               return (
              <div key={item.id} className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 border-2 border-pink-100 hover:border-pink-300 transition-all hover:shadow-lg">
                <div className="w-full sm:w-24 md:w-28 h-48 sm:h-24 md:h-28 flex items-center justify-center overflow-hidden rounded-lg cursor-pointer border-2 border-pink-100 hover:border-pink-400 transition-all self-center sm:self-start bg-gray-50">
                  <img
                    src={imageUrl}
                    alt={item.name || 'Product'}
                    className="w-full h-full object-contain"
                    onClick={() => navigate(`/product/${item.id}`)}
                    onError={(e) => {
                      console.error('Cart image error:', {
                        itemId: item.id,
                        itemName: item.name,
                        attemptedUrl: e.target.src,
                        originalImage: item.image
                      });
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholders.productList;
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 cursor-pointer hover:text-[#FF1493] transition-colors mb-1 sm:mb-2 line-clamp-2"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h3>
                      {item.size && (
                        <p className="text-[#FF1493] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Size: {item.size}</p>
                      )}
                      {(item.material || item.work) && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                          {item.material && item.work ? `${item.material} with ${item.work}` : item.material || item.work}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 mt-2 sm:mt-3">
                        <div className="flex items-center border-2 border-pink-300 rounded-lg overflow-hidden shadow-sm">
                          <button 
                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1, item.size)}
                            className="px-3 sm:px-4 py-2 bg-pink-50 text-[#FF1493] hover:bg-pink-100 font-bold cursor-pointer transition-colors touch-manipulation"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <span className="px-3 sm:px-5 py-2 border-x-2 border-pink-300 bg-white text-gray-900 font-semibold text-sm sm:text-base min-w-[2.5rem] text-center">{item.quantity || 1}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1, item.size)}
                            className="px-3 sm:px-4 py-2 bg-pink-50 text-[#FF1493] hover:bg-pink-100 font-bold cursor-pointer transition-colors touch-manipulation"
                            aria-label="Increase quantity"
                          >
                            <FaPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id, item.size || null)}
                          className="text-red-500 hover:text-red-700 flex items-center cursor-pointer font-medium transition-colors hover:bg-red-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm touch-manipulation sm:ml-4"
                          aria-label="Remove item"
                        >
                          <FaTrash className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> <span className="sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right w-full sm:w-auto flex sm:block items-center sm:items-end justify-between sm:justify-end gap-2">
                      <div>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#FF1493]">₹{(item.price * (item.quantity || 1)).toLocaleString()}</p>
                        {item.originalPrice > item.price && (
                          <p className="text-xs sm:text-sm text-gray-500 line-through mt-0.5 sm:mt-1">₹{item.originalPrice.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                 </div>
               </div>
             );
             })}
          </div>
          
          {/* Order Summary */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50/30">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <span className="w-0.5 sm:w-1 h-5 sm:h-6 bg-gradient-to-b from-[#FF1493] to-[#8B2BE2] rounded-full"></span>
                Order Summary
              </h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-pink-100">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-pink-100">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Shipping</span>
                  <span className={`text-sm sm:text-base ${cartTotal >= 1000 ? "text-[#FF1493] font-bold" : "text-gray-700 font-semibold"}`}>
                    {cartTotal >= 1000 ? 'Free ✓' : '₹99'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-pink-100">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Tax (5%)</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">₹{Math.round(cartTotal * 0.05).toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-pink-300 my-2 sm:my-3"></div>
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-pink-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#FF1493]">₹{(cartTotal + (cartTotal >= 1000 ? 0 : 99) + Math.round(cartTotal * 0.05)).toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout/address')}
                className="w-full text-black py-3 sm:py-4 px-3 sm:px-4 rounded-xl border-2 border-black transition-all font-bold shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base md:text-lg touch-manipulation"
                style={{ backgroundColor: headerColor }}
              >
                Proceed to Checkout
              </button>
              
              <button 
                onClick={clearCart}
                className="w-full mt-3 sm:mt-4 text-black border-2 border-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all font-semibold cursor-pointer transform hover:scale-105 active:scale-95 text-sm sm:text-base touch-manipulation"
                style={{ backgroundColor: headerColor }}
              >
                Clear Cart
              </button>
              
              <p className="text-[10px] sm:text-xs text-gray-500 mt-4 sm:mt-6 text-center leading-relaxed px-1">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
            
          </div>
        </div>
      )}
      </div>
      <ScrollToTop />
    </div>
  );
}

export default Cart;
