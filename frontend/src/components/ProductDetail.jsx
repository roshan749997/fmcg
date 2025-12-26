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
      await addToCart(product._id || product.id, 1, selectedSize, selectedColor);
    } catch (error) {
      if (error.message?.includes('login')) setShowLoginModal(true);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) return setShowLoginModal(true);
    try {
      await addToCart(product._id || product.id, 1, selectedSize, selectedColor);
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
  
  // Split product name for highlighting
  const nameWords = (product.name || product.title || 'Product').split(' ');
  const highlightWords = ['black', 'strap', 'steel', 'pro', 'sport', 'premium', 'designer'];

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </button>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            
            {/* LEFT COLUMN: Product Visualization */}
            <div className="relative lg:sticky lg:top-8 h-fit order-first lg:order-first">
              
              {/* Main Product Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 shadow-lg max-w-md mx-auto lg:max-w-full flex items-center justify-center">
                {/* Best Seller Badge */}
                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-semibold text-black shadow-sm">
                  best seller
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
                    <button 
                      onClick={handlePrevImage}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                <img 
                  src={imageUrl} 
                  alt={product.name || product.title || 'Product'} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholders.productDetail;
                  }}
                  loading="lazy"
                />
                
                {/* Interactive Labels */}
                {product.color && (
                  <div className="absolute top-1/4 right-4 sm:right-8">
                    <div className="relative">
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500 rounded-full z-10"></div>
                      <div className="bg-gray-800/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {product.color}
                      </div>
                    </div>
                  </div>
                )}
                {product.brand && (
                  <div className="absolute bottom-1/3 left-4 sm:left-8">
                    <div className="relative">
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500 rounded-full z-10"></div>
                      <div className="bg-gray-800/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {product.brand}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              {product.product_info?.availableSizes && product.product_info.availableSizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-black mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.product_info.availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xs font-medium text-black">{size}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Swatches */}
              {(product.product_info?.color || product.color) && (
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Select Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[product.product_info?.color || product.color || '#000000'].slice(0, 6).map((color, idx) => {
                      const isSelected = selectedColor === color || (!selectedColor && idx === 0);
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                            isSelected ? 'border-black scale-110 shadow-md' : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Information */}
            <div className="flex flex-col space-y-6 lg:space-y-8 order-last lg:order-last">
              
              {/* Product Title & Brand */}
              <div className="space-y-3">
                {(product.brand || product.product_info?.manufacturer) && (
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {product.brand || product.product_info?.manufacturer}
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
                  {nameWords.map((word, idx) => {
                    const shouldHighlight = highlightWords.some(hw => word.toLowerCase().includes(hw.toLowerCase()));
                    return (
                      <span key={idx} className="inline-block mr-2">
                        {shouldHighlight ? (
                          <span className="relative inline-block">
                            <span className="relative z-10">{word}</span>
                            <span className="absolute inset-0 bg-gray-200/40 rounded-lg blur-sm transform -rotate-1 -z-0"></span>
                          </span>
                        ) : (
                          <span>{word}</span>
                        )}
                      </span>
                    );
                  })}
                </h1>
              </div>

              {/* Price Section */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-gray-200">
                <span className="text-3xl lg:text-4xl font-bold text-black">₹{Math.round(finalPrice).toLocaleString()}</span>
                {originalPrice > finalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{Math.round(originalPrice).toLocaleString()}</span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 text-black font-semibold px-6 py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-base border-2 border-black"
                  style={{ backgroundColor: '#FFD1DC' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FFB6C1'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD1DC'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 text-black font-semibold px-6 py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-base border-2 border-black"
                  style={{ backgroundColor: '#FFD1DC' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#FFB6C1'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD1DC'}
                >
                  <span>Buy Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-semibold text-black uppercase">Free Shipping</span>
                  </div>
                  <p className="text-xs text-black">On orders over ₹1,000</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-xs font-semibold text-black uppercase">Easy Returns</span>
                  </div>
                  <p className="text-xs text-black">30 days return policy</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-black mb-4">Product Details</h3>
                <div className="space-y-3 text-sm text-black">
                  {(product.description || product.productDetails?.description) && (
                    <p className="leading-relaxed">
                      {product.description || product.productDetails?.description}
                    </p>
                  )}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {(product.brand || product.product_info?.brand) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Brand:</span>
                        <span className="text-black">{product.brand || product.product_info?.brand}</span>
                      </div>
                    )}
                    {(product.product_info?.manufacturer) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Manufacturer:</span>
                        <span className="text-black">{product.product_info.manufacturer}</span>
                      </div>
                    )}
                    
                    {/* Kids Clothing Fields */}
                    {(product.product_info?.clothingType) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Clothing Type:</span>
                        <span className="text-black">{product.product_info.clothingType}</span>
                      </div>
                    )}
                    {(product.product_info?.gender) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Gender:</span>
                        <span className="text-black">{product.product_info.gender}</span>
                      </div>
                    )}
                    {(product.product_info?.ageGroup) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Age Group:</span>
                        <span className="text-black">{product.product_info.ageGroup}</span>
                      </div>
                    )}
                    {(product.product_info?.fabric) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Fabric:</span>
                        <span className="text-black">{product.product_info.fabric}</span>
                      </div>
                    )}
                    {(product.product_info?.color || product.color) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Color:</span>
                        <span className="text-black capitalize">{product.product_info?.color || product.color}</span>
                      </div>
                    )}
                    
                    {/* Footwear Fields */}
                    {(product.product_info?.footwearType) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Footwear Type:</span>
                        <span className="text-black">{product.product_info.footwearType}</span>
                      </div>
                    )}
                    {(product.product_info?.shoeMaterial) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Material:</span>
                        <span className="text-black">{product.product_info.shoeMaterial}</span>
                      </div>
                    )}
                    {(product.product_info?.soleMaterial) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Sole Material:</span>
                        <span className="text-black">{product.product_info.soleMaterial}</span>
                      </div>
                    )}
                    
                    {/* Kids Accessories Fields */}
                    {(product.product_info?.accessoryType) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Accessory Type:</span>
                        <span className="text-black">{product.product_info.accessoryType}</span>
                      </div>
                    )}
                    {(product.product_info?.material) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Material:</span>
                        <span className="text-black">{product.product_info.material}</span>
                      </div>
                    )}
                    
                    {/* Baby Care Fields */}
                    {(product.product_info?.babyCareType) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Baby Care Type:</span>
                        <span className="text-black">{product.product_info.babyCareType}</span>
                      </div>
                    )}
                    {(product.product_info?.ageRange) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Age Range:</span>
                        <span className="text-black">{product.product_info.ageRange}</span>
                      </div>
                    )}
                    {(product.product_info?.safetyStandard) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Safety Standard:</span>
                        <span className="text-black">{product.product_info.safetyStandard}</span>
                      </div>
                    )}
                    {(product.product_info?.quantity) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Quantity:</span>
                        <span className="text-black">{product.product_info.quantity}</span>
                      </div>
                    )}
                    
                    {/* Toys Fields */}
                    {(product.product_info?.toyType) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Toy Type:</span>
                        <span className="text-black">{product.product_info.toyType}</span>
                      </div>
                    )}
                    {(product.product_info?.batteryRequired !== undefined) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Battery Required:</span>
                        <span className="text-black">{product.product_info.batteryRequired ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    {(product.product_info?.batteryIncluded !== undefined) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Battery Included:</span>
                        <span className="text-black">{product.product_info.batteryIncluded ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                    
                    {/* Universal Fields */}
                    {(product.product_info?.availableSizes && product.product_info.availableSizes.length > 0) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Available Sizes:</span>
                        <span className="text-black">{product.product_info.availableSizes.join(', ')}</span>
                      </div>
                    )}
                    {(product.product_info?.includedComponents) && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Included:</span>
                        <span className="text-black">{product.product_info.includedComponents}</span>
                      </div>
                    )}
                    
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Category:</span>
                        <span className="text-black capitalize">{product.category}</span>
                      </div>
                    )}
                    {product.mrp && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">MRP:</span>
                        <span className="text-black">₹{product.mrp.toLocaleString()}</span>
                      </div>
                    )}
                    {product.discountPercent > 0 && (
                      <div className="flex justify-between">
                        <span className="font-medium text-black">Discount:</span>
                        <span className="text-black">{product.discountPercent}% OFF</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery & Returns Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-black mb-4">Shipping & Returns</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-medium text-black">Free Shipping</p>
                      <p className="text-black">On orders over ₹1,000. Standard delivery in 5-7 business days.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div>
                      <p className="font-medium text-black">30-Day Returns</p>
                      <p className="text-black">Easy returns within 30 days of purchase. No questions asked.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="font-medium text-black">Secure Payment</p>
                      <p className="text-black">Your payment information is safe and encrypted.</p>
                    </div>
                  </div>
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
