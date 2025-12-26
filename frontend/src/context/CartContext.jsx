import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const hasToken = () => Boolean(localStorage.getItem('auth_token'));

  const mapServerCartToUI = useCallback((data) => {
    const items = data?.items || [];
    return items.map((i) => {
      const p = i.product || {};
      
      // Debug: Log product structure
      console.log('Cart product mapping:', {
        productId: p._id || p.id,
        productTitle: p.title,
        hasImages: !!p.images,
        imagesType: typeof p.images,
        imagesValue: p.images,
        hasImage: !!p.image,
        imageValue: p.image,
        productKeys: Object.keys(p)
      });
      
      const price = typeof p.price === 'number'
        ? p.price
        : (typeof p.mrp === 'number' ? Math.round(p.mrp - (p.mrp * (p.discountPercent || 0) / 100)) : 0);
      
      // Get image URL - prefer image1, fallback to image2, image3, or legacy image field
      let imageUrl = null;
      
      // Check images object format: { image1: "url", image2: "url" }
      if (p.images && typeof p.images === 'object' && !Array.isArray(p.images)) {
        imageUrl = p.images.image1 || p.images.image2 || p.images.image3 || null;
        // Clean up the URL - remove any whitespace
        if (imageUrl && typeof imageUrl === 'string') {
          imageUrl = imageUrl.trim();
          if (imageUrl === '') imageUrl = null;
        }
      }
      
      // Check images array format: [{ url: "..." }] or ["url1", "url2"]
      if (!imageUrl && Array.isArray(p.images) && p.images.length > 0) {
        const firstImg = p.images[0];
        if (typeof firstImg === 'string' && firstImg.trim() !== '') {
          imageUrl = firstImg.trim();
        } else if (firstImg?.url && typeof firstImg.url === 'string' && firstImg.url.trim() !== '') {
          imageUrl = firstImg.url.trim();
        }
      }
      
      // Fallback to legacy image field
      if (!imageUrl && p.image) {
        if (typeof p.image === 'string' && p.image.trim() !== '') {
          imageUrl = p.image.trim();
        }
      }
      
      console.log('Extracted image URL:', { 
        productId: p._id || p.id, 
        imageUrl,
        finalImageUrl: imageUrl || 'NO IMAGE FOUND'
      });
      
      return {
        id: p._id || p.id, // used by UI and for remove
        name: p.title || p.name || 'Untitled Product',
        image: imageUrl, // Store the image URL string
        material: p.product_info?.fabric || p.product_info?.material || p.product_info?.shoeMaterial || p.product_info?.SareeMaterial,
        work: p.product_info?.includedComponents || p.product_info?.IncludedComponents,
        price,
        originalPrice: p.mrp || p.originalPrice || price,
        quantity: i.quantity || 1,
        size: i.size || null, // Include size from cart item
      };
    });
  }, []);

  const loadCart = useCallback(async () => {
    if (!hasToken()) {
      setCart([]);
      return;
    }
    try {
      const data = await api.getCart();
      setCart(mapServerCartToUI(data));
    } catch (error) {
      // Handle 401 (Unauthorized) or invalid token errors gracefully
      if (error.status === 401 || error.message?.includes('Invalid token') || error.message?.includes('Unauthorized')) {
        // Token is invalid, clear cart and optionally clear the invalid token
        setCart([]);
        // Optionally clear invalid token
        try {
          localStorage.removeItem('auth_token');
        } catch (e) {
          // Ignore localStorage errors
        }
      } else {
        // For other errors, just log them but don't break the app
        console.error('Error loading cart:', error);
        setCart([]);
      }
    }
  }, [mapServerCartToUI]);

  const requireAuth = useCallback(() => {
    if (!hasToken()) {
      alert('Please login to access your cart');
      navigate('/signin', { state: { from: location }, replace: true });
      return false;
    }
    return true;
  }, [navigate, location]);

  const addToCart = useCallback(async (productIdOrObj, quantity = 1, size = null) => {
    if (!requireAuth()) return;
    // Accept either productId or a product object
    let productId = productIdOrObj;
    if (typeof productIdOrObj === 'object' && productIdOrObj) {
      productId = productIdOrObj._id || productIdOrObj.id;
    }
    try {
      await api.addToCart({ productId, quantity, size });
      await loadCart();
    } catch (error) {
      // Handle 401 (Unauthorized) - token is invalid
      if (error.status === 401 || error.message?.includes('Invalid token') || error.message?.includes('Unauthorized')) {
        // Clear invalid token and redirect to login
        try {
          localStorage.removeItem('auth_token');
        } catch (e) {
          // Ignore localStorage errors
        }
        alert('Your session has expired. Please login again.');
        navigate('/signin', { state: { from: location }, replace: true });
        throw error; // Re-throw to let the caller handle it
      }
      throw error; // Re-throw other errors
    }
  }, [requireAuth, loadCart, navigate, location]);

  const removeFromCart = useCallback(async (productId, size = null) => {
    if (!requireAuth()) return;
    await api.removeFromCart(productId, size);
    await loadCart();
  }, [requireAuth, loadCart]);

  const updateQuantity = useCallback(async (productId, newQuantity, size = null) => {
    if (!requireAuth()) return;
    if (newQuantity < 1) {
      // Pass size when removing so it removes the correct item
      if (size) {
        await api.removeFromCart(productId, size);
      } else {
        await removeFromCart(productId);
      }
      return;
    }
    
    // Use update endpoint to preserve size
    try {
      await api.updateCartQuantity({ productId, quantity: newQuantity, size });
      await loadCart();
    } catch (error) {
      // Fallback to old method if update endpoint doesn't exist
      const current = cart.find(i => i.id === productId && (!size || i.size === size))?.quantity || 0;
      const delta = newQuantity - current;
      if (delta === 0) return;
      if (delta > 0) {
        await api.addToCart({ productId, quantity: delta, size });
        await loadCart();
      } else {
        // Simulate decrement: remove then add desired quantity with size
        if (size) {
          await api.removeFromCart(productId, size);
          await api.addToCart({ productId, quantity: newQuantity, size });
        } else {
          await api.removeFromCart(productId);
          await api.addToCart({ productId, quantity: newQuantity });
        }
        await loadCart();
      }
    }
  }, [requireAuth, removeFromCart, cart, loadCart]);

  const clearCart = useCallback(async () => {
    // No dedicated clear endpoint; remove each item
    if (!requireAuth()) return;
    for (const item of cart) {
      await api.removeFromCart(item.id);
    }
    await loadCart();
  }, [requireAuth, cart, loadCart]);

  const cartTotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => {
    loadCart();
    const onStorage = (e) => {
      if (!e || e.key === 'auth_token') loadCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadCart]);

  // Also reload on route changes to reflect auth changes in the same tab
  useEffect(() => {
    loadCart();
  }, [location.pathname, loadCart]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
