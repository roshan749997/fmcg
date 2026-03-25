import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchSareeById, fetchSarees } from '../services/api';
import { placeholders, getProductImage } from '../utils/imagePlaceholder';
import { FaRupeeSign, FaSpinner, FaStar, FaRegStar } from 'react-icons/fa';
import ScrollToTop from './ScrollToTop';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Simple LoginModal Component
const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-black mb-4">Login Required</h2>
        <p className="text-black mb-6">Please login to continue.</p>
        <div className="flex gap-3">
          <Link
            to="/signin"
            className="flex-1 text-black font-semibold px-6 py-3 rounded-lg text-center border-2 border-black transition-all"
            style={{ backgroundColor: '#FFD1DC' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#FFB6C1'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD1DC'}
          >
            Login
          </Link>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple ProductCard Component
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const productImages = product.images || (product.image ? [product.image] : []);
  const imageUrl = Array.isArray(productImages) && productImages.length > 0 
    ? (typeof productImages[0] === 'string' ? productImages[0] : productImages[0].url || placeholders.productList)
    : getProductImage(product, 'image1');
  const finalPrice = product.finalPrice || product.price || (product.mrp ? product.mrp - (product.mrp * (product.discountPercent || 0) / 100) : 0);
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const discountPercent = product.discountPercent || (originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);

  return (
    <div
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      className="group bg-white overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-300 transform hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.name || product.title || 'Product'}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholders.productList;
          }}
          loading="lazy"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-[#8B2BE2] to-[#FF1493] text-white text-xs font-bold px-2 py-1 rounded-md shadow-md uppercase">
            {discountPercent}% OFF
          </span>
        )}
      </div>
      <div className="relative p-4 bg-white">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B2BE2] via-[#FF1493] to-[#8B2BE2] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        <h3 className="text-xs font-semibold text-[#FF1493] uppercase tracking-wide line-clamp-1 mb-1">
          {product.product_info?.manufacturer || product.brand || 'KIDZO'}
        </h3>
        <p className="text-sm font-bold text-black line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-[#FF1493] transition-colors">
          {product.name || product.title || 'Untitled Product'}
        </p>
        <div className="flex items-baseline gap-2">
          <div className="flex items-center">
            <FaRupeeSign className="h-3 w-3 text-black" />
            <span className="text-lg font-bold text-black ml-0.5">
              {Math.round(finalPrice).toLocaleString()}
            </span>
          </div>
          {originalPrice > finalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{Math.round(originalPrice).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const isAuthenticated = () => {
    try {
      return Boolean(localStorage.getItem('auth_token'));
    } catch {
      return false;
    }
  };
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  const [shouldLoadTrending, setShouldLoadTrending] = useState(false);
  const [shouldLoadSale, setShouldLoadSale] = useState(false);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [id, category]);

  // Lazy load trending and sale sections when scrolled into view
  useEffect(() => {
    if (!product) return;

    const trendingObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !shouldLoadTrending) {
          setShouldLoadTrending(true);
          fetchTrendingProducts(product);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    const saleObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !shouldLoadSale) {
          setShouldLoadSale(true);
          fetchSaleProducts(product);
        }
      },
      { rootMargin: '200px' }
    );

    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const trendingElement = document.getElementById('trending-section');
      const saleElement = document.getElementById('sale-section');

      if (trendingElement) trendingObserver.observe(trendingElement);
      if (saleElement) saleObserver.observe(saleElement);
    }, 500);

    return () => {
      const trendingElement = document.getElementById('trending-section');
      const saleElement = document.getElementById('sale-section');
      if (trendingElement) trendingObserver.unobserve(trendingElement);
      if (saleElement) saleObserver.unobserve(saleElement);
    };
  }, [product, shouldLoadTrending, shouldLoadSale]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchSareeById(id);
      setProduct(data);
      
      // Set default size/color if available
      if (data.product_info?.availableSizes?.length > 0) {
        setSelectedSize(data.product_info.availableSizes[0]);
      }
      if (data.product_info?.color || data.color) {
        setSelectedColor(data.product_info?.color || data.color);
      }
      
      // Fetch recommended products immediately (same category, fast)
      fetchRecommendedProducts(data);
      
      // Load trending and sale products lazily (only when scrolled into view)
      // This makes initial page load faster
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingRecommendations(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const productCategory = currentProduct.category || category || 'kids-clothing';
      
      // Fetch products from same category
      const allProducts = await fetchSarees(productCategory);
      
      // Filter out current product
      let filtered = allProducts.filter(p => (p._id || p.id) !== currentProductId);
      
      // If product has a brand, prioritize same brand products
      if (currentProduct.brand || currentProduct.product_info?.manufacturer) {
        const brand = currentProduct.brand || currentProduct.product_info?.manufacturer;
        const sameBrand = filtered.filter(p => 
          (p.brand === brand) || (p.product_info?.manufacturer === brand)
        );
        const differentBrand = filtered.filter(p => 
          (p.brand !== brand) && (p.product_info?.manufacturer !== brand)
        );
        filtered = [...sameBrand, ...differentBrand];
      }

      // Shuffle array to randomize
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffled = shuffleArray(filtered);
      const selectedProducts = shuffled.slice(0, 10);

      // Normalize products
      const normalized = selectedProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || (p.image ? [p.image] : []),
        image: Array.isArray(p.images) && p.images.length > 0 
          ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)
          : p.image || getProductImage(p, 'image1'),
        price: p.finalPrice || p.price || (p.mrp ? p.mrp - (p.mrp * (p.discountPercent || 0) / 100) : 0),
        originalPrice: p.originalPrice || p.mrp || p.price || 0,
      }));

      setRecommendedProducts(normalized);
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      setRecommendedProducts([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchTrendingProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingTrending(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      
      // Try to use backend trending API first (faster)
      try {
        const { getTrendingProducts } = await import('../services/api');
        const trendingData = await getTrendingProducts(12, 7);
        if (trendingData?.products && trendingData.products.length > 0) {
          const filtered = trendingData.products.filter(p => (p._id || p.id) !== currentProductId).slice(0, 12);
          const normalized = filtered.map(p => ({
            ...p,
            id: p._id || p.id,
            images: p.images || (p.image ? [p.image] : []),
            image: Array.isArray(p.images) && p.images.length > 0 
              ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)
              : p.image || getProductImage(p, 'image1'),
            price: p.finalPrice || p.price || (p.mrp ? p.mrp - (p.mrp * (p.discountPercent || 0) / 100) : 0),
            originalPrice: p.originalPrice || p.mrp || p.price || 0,
          }));
          setTrendingProducts(normalized);
          setLoadingTrending(false);
          return;
        }
      } catch (apiError) {
        console.log('Trending API not available, using fallback');
      }
      
      // Fallback: Fetch from only 2-3 categories (faster)
      const categories = ['kids-clothing', 'kids-accessories', 'footwear'];
      const allProductsPromises = categories.map(cat => fetchSarees(cat).catch(() => []));
      const allProductsArrays = await Promise.all(allProductsPromises);
      const allProducts = allProductsArrays.flat().filter(p => (p._id || p.id) !== currentProductId);

      // Simple random selection (faster than shuffle)
      const randomProducts = [];
      const maxProducts = Math.min(12, allProducts.length);
      const usedIndices = new Set();
      
      while (randomProducts.length < maxProducts && usedIndices.size < allProducts.length) {
        const randomIndex = Math.floor(Math.random() * allProducts.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          randomProducts.push(allProducts[randomIndex]);
        }
      }

      // Normalize products
      const normalized = randomProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || (p.image ? [p.image] : []),
        image: Array.isArray(p.images) && p.images.length > 0 
          ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)
          : p.image || getProductImage(p, 'image1'),
        price: p.finalPrice || p.price || (p.mrp ? p.mrp - (p.mrp * (p.discountPercent || 0) / 100) : 0),
        originalPrice: p.originalPrice || p.mrp || p.price || 0,
      }));

      setTrendingProducts(normalized);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setTrendingProducts([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  const fetchSaleProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingSale(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      
      // Fetch from only 2-3 categories (faster)
      const categories = ['kids-clothing', 'kids-accessories', 'footwear'];
      const allProductsPromises = categories.map(cat => fetchSarees(cat).catch(() => []));
      const allProductsArrays = await Promise.all(allProductsPromises);
      const allProducts = allProductsArrays.flat();

      // Filter products that are on sale (optimized)
      const saleItems = [];
      for (const p of allProducts) {
        const productId = p._id || p.id;
        if (productId === currentProductId) continue;
        
        const finalPrice = p.finalPrice || p.price || (p.mrp ? p.mrp - (p.mrp * (p.discountPercent || 0) / 100) : 0);
        const originalPrice = p.originalPrice || p.mrp || p.price || 0;
        const hasDiscount = originalPrice > finalPrice;
        const discountPercent = p.discountPercent || (hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
        
        if (p.onSale === true || hasDiscount || discountPercent > 0) {
          saleItems.push(p);
          if (saleItems.length >= 12) break; // Stop early if we have enough
        }
      }

      // Simple random selection (faster than shuffle)
      const selectedSaleProducts = [];
      const maxProducts = Math.min(12, saleItems.length);
      const usedIndices = new Set();
      
      while (selectedSaleProducts.length < maxProducts && usedIndices.size < saleItems.length) {
        const randomIndex = Math.floor(Math.random() * saleItems.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          selectedSaleProducts.push(saleItems[randomIndex]);
        }
      }

      // Normalize products
      const normalized = selectedSaleProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || (p.image ? [p.image] : []),
        image: Array.isArray(p.images) && p.images.length > 0 
          ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)
          : p.image || getProductImage(p, 'image1'),
        price: p.finalPrice || p.price || (p.mrp ? p.mrp - (p.mrp * (p.discountPercent || 0) / 100) : 0),
        originalPrice: p.originalPrice || p.mrp || p.price || 0,
      }));

      setSaleProducts(normalized);
    } catch (error) {
      console.error('Error fetching sale products:', error);
      setSaleProducts([]);
    } finally {
      setLoadingSale(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) return setShowLoginModal(true);
    try {
      await addToCart(product._id || product.id, quantity, selectedSize, selectedColor);
    } catch (error) {
      if (error.message?.includes('login')) setShowLoginModal(true);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) return setShowLoginModal(true);
    try {
      await addToCart(product._id || product.id, quantity, selectedSize, selectedColor);
      navigate('/cart');
    } catch (error) {
      if (error.message?.includes('login')) setShowLoginModal(true);
    }
  };

  const handlePrevImage = () => {
    const productImages = product.images || (product.image ? [product.image] : []);
    const images = Array.isArray(productImages) ? productImages : Object.values(productImages || {});
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const productImages = product.images || (product.image ? [product.image] : []);
    const images = Array.isArray(productImages) ? productImages : Object.values(productImages || {});
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <LoadingState />;
  if (!product) return <NotFoundState />;

  const productImages = product.images || (product.image ? [product.image] : []);
  const images = Array.isArray(productImages) ? productImages : Object.values(productImages || {});
  const currentImage = images[selectedImageIndex] || images[0] || placeholders.productDetail;
  const imageUrl = typeof currentImage === 'string' ? currentImage : (currentImage?.url || placeholders.productDetail);
  
  const finalPrice = product.finalPrice || product.price || (product.mrp ? product.mrp - (product.mrp * (product.discountPercent || 0) / 100) : 0);
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const discountPercent = originalPrice > finalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : (product.discountPercent || 0);
  const productTitle = product.name || product.title || 'Product';
  const productBrand = product.brand || product.product_info?.brand || product.product_info?.manufacturer || '';
  const productDescription = product.description || product.productDetails?.description || '';
  const productCategory = product.category || '';
  const productSubCategory = product.subcategory || product['Sub-Category'] || '';
  const productLeafCategory = product.subSubCategory || product['Sub-sub-Category'] || '';
  const availableSizes = product.product_info?.availableSizes || [];
  const productColor = product.product_info?.color || product.color || '';
  const specRows = [
    productBrand ? ['Brand', productBrand] : null,
    product.product_info?.manufacturer ? ['Manufacturer', product.product_info.manufacturer] : null,
    productCategory ? ['Category', productCategory] : null,
    productSubCategory ? ['Sub Category', productSubCategory] : null,
    productLeafCategory ? ['Product Type', productLeafCategory] : null,
    product.product_info?.material ? ['Material', product.product_info.material] : null,
    product.product_info?.shoeMaterial ? ['Material', product.product_info.shoeMaterial] : null,
    availableSizes.length > 0 ? ['Available Sizes', availableSizes.join(', ')] : null,
    productColor ? ['Color', productColor] : null,
  ].filter(Boolean);
  
  // Keep a clean, readable title style across all products
  const displayTitle = productTitle;

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="max-w-[1320px] mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6 pb-20 sm:pb-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </button>

          <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)] p-3 sm:p-4 lg:p-5">
            <div className="grid lg:grid-cols-[44%_56%] gap-3 sm:gap-4 lg:gap-6">
            
            {/* LEFT COLUMN: Flipkart-like gallery */}
            <div className="p-1 sm:p-2 h-fit">
              <div className="grid grid-cols-[56px_1fr] gap-3">
                <div className="space-y-2 max-h-[420px] overflow-auto pr-1 scrollbar-hide">
                  {images.map((img, idx) => {
                    const thumbUrl = typeof img === 'string' ? img : (img?.url || placeholders.thumbnail);
                    const isActive = idx === selectedImageIndex;
                    return (
                      <button
                        key={`${thumbUrl}-${idx}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-12 h-12 border rounded-sm overflow-hidden bg-white ${
                          isActive ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholders.thumbnail;
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <div className="aspect-square max-h-[360px] sm:max-h-[400px] lg:max-h-[420px] xl:max-h-[460px] w-full bg-white flex items-center justify-center border border-gray-100 rounded-sm overflow-hidden mx-auto">
                    <img
                      src={imageUrl}
                      alt={productTitle}
                      className="max-w-full max-h-full object-contain p-3 sm:p-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholders.productDetail;
                      }}
                      loading="lazy"
                    />
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm"
                        aria-label="Previous image"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm"
                        aria-label="Next image"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 hidden sm:flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#ff9f00] text-white font-semibold rounded-sm hover:opacity-95"
                >
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-12 bg-[#fb641b] text-white font-semibold rounded-sm hover:opacity-95"
                >
                  BUY NOW
                </button>
              </div>

              {availableSizes.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-sm border transition-all text-sm ${
                            isSelected
                              ? 'border-blue-600 text-blue-700 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {productColor && (
                <div className="mt-4 text-sm text-gray-700">
                  <span className="font-medium">Color:</span> {productColor}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Flipkart-like info */}
            <div className="p-2 sm:p-3 space-y-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-[#212121] leading-snug">{displayTitle}</h1>
                {productBrand && (
                  <p className="text-sm text-[#878787] mt-1">by <span className="text-[#2874f0] font-medium">{productBrand}</span></p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs px-2 py-0.5 rounded">
                    4.2 <FaStar className="w-3 h-3" />
                  </span>
                  <span className="text-xs text-[#878787]">2,184 ratings & 146 reviews</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xl font-semibold text-[#212121]">₹{Math.round(finalPrice).toLocaleString()}</span>
                {originalPrice > finalPrice && <span className="text-base text-[#878787] line-through">₹{Math.round(originalPrice).toLocaleString()}</span>}
                {discountPercent > 0 && <span className="text-base font-semibold text-[#388e3c]">{discountPercent}% off</span>}
              </div>

              <div className="border border-[#f0f0f0] rounded-sm p-3 bg-[#fcfcfc]">
                <h3 className="text-sm font-semibold text-[#212121] mb-2">Available offers</h3>
                <ul className="space-y-1.5 text-sm text-[#212121]">
                  <li><span className="font-medium">Bank Offer</span> 10% Instant Discount on select cards</li>
                  <li><span className="font-medium">Special Price</span> Extra discount on combo orders</li>
                  <li><span className="font-medium">Free Delivery</span> for orders above ₹1,000</li>
                </ul>
              </div>

              <div className="grid sm:grid-cols-[120px_1fr] gap-2 items-center">
                <span className="text-sm text-[#878787]">Quantity</span>
                <div className="inline-flex items-center border border-gray-300 rounded-sm w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 text-lg text-[#212121] hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-8 h-8 text-lg text-[#212121] hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-[120px_1fr] gap-2 items-center border-b border-[#f0f0f0] pb-4">
                <span className="text-sm text-[#878787]">Delivery</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    className="h-9 px-3 border border-[#dfe1e5] rounded-sm text-sm outline-none focus:border-[#2874f0] w-full sm:w-48"
                  />
                  <button className="text-sm font-semibold text-[#2874f0]">Check</button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#212121] mb-3">Product details</h3>
                <div className="grid sm:grid-cols-[170px_1fr] gap-y-2 text-sm">
                  {specRows.map(([label, value]) => (
                    <>
                      <div key={`${label}-label`} className="text-[#878787]">{label}</div>
                      <div key={`${label}-value`} className="text-[#212121]">{value}</div>
                    </>
                  ))}
                </div>
              </div>

              {productDescription && (
                <div>
                  <h3 className="text-lg font-medium text-[#212121] mb-2">Description</h3>
                  <p className="text-sm text-[#212121] leading-6 whitespace-pre-line">{productDescription}</p>
                </div>
              )}

              <div className="bg-[#f5faff] border border-[#d6e8ff] rounded-sm p-3 text-sm">
                <div className="font-medium text-[#212121]">Safe and secure payments. Easy returns.</div>
                <div className="text-[#555] mt-1">Free shipping on eligible orders.</div>
              </div>
            </div>
          </div>
          </div>

          {/* Trending Now Section - All Product Recommendations */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 mb-12 sm:mb-20">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-1">Trending Now</h2>
              <p className="text-xs sm:text-sm text-black">Popular picks across all categories</p>
            </div>

            {/* You may also like - Related products */}
            {(recommendedProducts.length > 0 || loadingRecommendations) && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">You may also like</h3>
                {loadingRecommendations ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                        <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="flex gap-4 min-w-max">
                        {recommendedProducts.map((recommendedProduct) => (
                          <div key={recommendedProduct.id} className="flex-shrink-0 w-48">
                            <ProductCard product={recommendedProduct} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* On Sale Section */}
            <div id="sale-section" className="mb-8 sm:mb-12">
              {(saleProducts.length > 0 || loadingSale || shouldLoadSale) && (
                <>
                  <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">On Sale</h3>
                  {loadingSale ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                          <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <div 
                        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                        style={{ 
                          scrollbarWidth: 'none', 
                          msOverflowStyle: 'none'
                        }}
                      >
                        <div className="flex gap-4 min-w-max">
                          {saleProducts.map((saleProduct) => (
                            <div key={saleProduct.id} className="flex-shrink-0 w-48">
                              <ProductCard product={saleProduct} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* More from [Brand] Section */}
            {product?.brand && (recommendedProducts.length > 0 || loadingRecommendations) && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">More from {product.brand}</h3>
                {loadingRecommendations ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                        <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="flex gap-4 min-w-max">
                        {recommendedProducts
                          .filter(p => (p.brand || p.product_info?.manufacturer) === product.brand)
                          .slice(0, 8)
                          .map((recommendedProduct) => (
                            <div key={recommendedProduct.id} className="flex-shrink-0 w-48">
                              <ProductCard product={recommendedProduct} />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trending Now - Popular picks across all categories */}
            <div id="trending-section" className="mb-8 sm:mb-12">
              {(trendingProducts.length > 0 || loadingTrending || shouldLoadTrending) && (
                <>
                  <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4">
                    Trending Now - Popular picks across all categories
                  </h3>
                  {loadingTrending ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                          <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <div 
                        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                        style={{ 
                          scrollbarWidth: 'none', 
                          msOverflowStyle: 'none'
                        }}
                      >
                        <div className="flex gap-4 min-w-max">
                          {trendingProducts.map((trendingProduct) => (
                            <div key={trendingProduct.id} className="flex-shrink-0 w-48">
                              <ProductCard product={trendingProduct} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-2 grid grid-cols-2 gap-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <button
          onClick={handleAddToCart}
          className="h-11 bg-[#ff9f00] text-white text-sm font-semibold rounded-sm"
        >
          ADD TO CART
        </button>
        <button
          onClick={handleBuyNow}
          className="h-11 bg-[#fb641b] text-white text-sm font-semibold rounded-sm"
        >
          BUY NOW
        </button>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <ScrollToTop />
    </>
  );
};

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      <p className="text-black font-medium">Loading details...</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white">
    <h1 className="text-2xl font-bold text-black mb-2">Product Not Found</h1>
    <p className="text-black mb-6">The product you are looking for doesn't exist or has been removed.</p>
    <Link 
      to="/" 
      className="text-black px-8 py-3 rounded-lg font-medium border-2 border-black transition-all"
      style={{ backgroundColor: '#FFD1DC' }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#FFB6C1'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD1DC'}
    >
      Back to Home
    </Link>
  </div>
);

export default ProductDetail;
