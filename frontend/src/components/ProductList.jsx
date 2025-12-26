import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaRupeeSign, FaSpinner, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { fetchSarees } from '../services/api';
import { placeholders, getProductImage } from '../utils/imagePlaceholder';
import ScrollToTop from './ScrollToTop';
import { useHeaderColor } from '../utils/useHeaderColor';

// Add CSS to hide scrollbar and loading animation
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(300%);
    }
  }
  @keyframes slide-in-from-right {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .animate-in {
    animation: slide-in-from-right 0.3s ease-out;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #000000;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #000000;
  }
  /* Ensure sticky positioning works */
  .filter-sticky-container {
    position: relative;
    overflow: visible !important;
  }
  .filter-sticky-sidebar {
    position: -webkit-sticky !important;
    position: sticky !important;
  }
`;

const ProductList = ({ defaultCategory } = {}) => {
  const { categoryName, subCategoryName, mainCategory } = useParams();
  const navigate = useNavigate();
  const headerColor = useHeaderColor();
  const navbarRef = useRef(null);
  const filterSidebarRef = useRef(null);
  const filterContainerRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(80);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(20); // Initial products to show
  const loadMoreRef = useRef(null);
  
  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [customPriceFrom, setCustomPriceFrom] = useState('');
  const [customPriceTo, setCustomPriceTo] = useState('');
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  
  // Product-specific filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedShoeMaterials, setSelectedShoeMaterials] = useState([]);
  const [selectedShoeTypes, setSelectedShoeTypes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedWatchMovements, setSelectedWatchMovements] = useState([]);
  const [selectedWatchCaseMaterials, setSelectedWatchCaseMaterials] = useState([]);
  const [selectedWatchBandMaterials, setSelectedWatchBandMaterials] = useState([]);
  const [selectedWaterResistance, setSelectedWaterResistance] = useState([]);
  
  // Accordion states for desktop filters
  const [openSections, setOpenSections] = useState({
    price: true,
    material: true,
    brand: true,
    type: true,
    size: true,
    movement: true,
    caseMaterial: true,
    bandMaterial: true,
    waterResistance: true
  });
  
  // Normalize category name helper
  const normalize = (s) => {
    if (!s) return '';
    const t = s.replace(/-/g, ' ').toLowerCase();
    return t.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Handle 3-segment paths: /category/shoes/mens-shoes/sports-shoes
  // Calculate effectiveCategory and effectiveSubCategory
  const effectiveCategory = React.useMemo(() => {
    if (mainCategory && categoryName && subCategoryName) {
      // 3-segment path: /category/shoes/mens-shoes/sports-shoes
      return normalize(categoryName); // "Mens Shoes"
    } else if (categoryName && subCategoryName) {
      // 2-segment path: /category/shoes/mens-shoes
      return normalize(categoryName); // "Shoes"
    } else if (categoryName) {
      // 1-segment path: /category/shoes
      return normalize(categoryName); // "Shoes"
    }
    return '';
  }, [mainCategory, categoryName, subCategoryName]);

  const effectiveSubCategory = React.useMemo(() => {
    if (mainCategory && categoryName && subCategoryName) {
      // 3-segment path: /category/shoes/mens-shoes/sports-shoes
      return normalize(subCategoryName); // "Sports Shoes"
    } else if (categoryName && subCategoryName) {
      // 2-segment path: /category/shoes/mens-shoes
      return normalize(subCategoryName); // "Mens Shoes"
    }
    return '';
  }, [mainCategory, categoryName, subCategoryName]);
  
  // Detect product type from category
  const isShoesCategory = React.useMemo(() => {
    const cat = (effectiveCategory || effectiveSubCategory || '').toLowerCase();
    return cat.includes('shoe') || cat.includes('sneaker') || cat.includes('boot') || cat.includes('sandal');
  }, [effectiveCategory, effectiveSubCategory]);
  
  const isWatchCategory = React.useMemo(() => {
    const cat = (effectiveCategory || effectiveSubCategory || '').toLowerCase();
    return cat.includes('watch');
  }, [effectiveCategory, effectiveSubCategory]);

  // Calculate navbar height for sticky positioning
  useEffect(() => {
    const calculateNavbarHeight = () => {
      // First try to get from CSS variable set by Layout component
      const root = document.documentElement;
      const cssVar = getComputedStyle(root).getPropertyValue('--app-header-height').trim();
      if (cssVar && cssVar !== '0px') {
        const height = parseFloat(cssVar);
        if (!isNaN(height) && height > 0) {
          setNavbarHeight(height);
          return;
        }
      }
      
      // Fallback: calculate from navbar element
      const navbar = document.querySelector('nav');
      if (navbar) {
        const height = navbar.offsetHeight || navbar.getBoundingClientRect().height;
        if (height > 0) {
          setNavbarHeight(height);
          return;
        }
      }
      
      // Calculate from fixed header wrapper
      const headerWrapper = document.querySelector('[ref*="headerWrapRef"], .fixed.top-0');
      if (headerWrapper) {
        const height = headerWrapper.offsetHeight || headerWrapper.getBoundingClientRect().height;
        if (height > 0) {
          setNavbarHeight(height);
          return;
        }
      }
      
      // Final fallback: approximate navbar height
      const fallbackHeight = window.innerWidth >= 768 ? 80 : 72;
      setNavbarHeight(fallbackHeight);
    };
    
    // Calculate on mount and after delays to ensure navbar is rendered
    calculateNavbarHeight();
    const timeoutId = setTimeout(calculateNavbarHeight, 100);
    const timeoutId2 = setTimeout(calculateNavbarHeight, 300);
    const timeoutId3 = setTimeout(calculateNavbarHeight, 600);
    
    window.addEventListener('resize', calculateNavbarHeight);
    window.addEventListener('load', calculateNavbarHeight);
    
    // Also listen for when navbar might change
    const observer = new MutationObserver(calculateNavbarHeight);
    const navbar = document.querySelector('nav');
    if (navbar) {
      observer.observe(navbar, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    }
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      window.removeEventListener('resize', calculateNavbarHeight);
      window.removeEventListener('load', calculateNavbarHeight);
      observer.disconnect();
    };
  }, []);

  // Handle scroll to ensure filter stays below navbar
  useEffect(() => {
    const handleScroll = () => {
      if (!filterContainerRef.current) return;
      
      const container = filterContainerRef.current;
      const rect = container.getBoundingClientRect();
      const shouldBeSticky = rect.top <= navbarHeight;
      
      setIsFilterSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navbarHeight]);
  
  // Available fabric options
  const allPossibleFabrics = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen', 'Satin', 'Velvet', 'Organza', 'Banarasi', 'Kanjivaram', 'Katan', 'Tussar', 'Maheshwari', 'Chanderi', 'Kota', 'Gota Patti', 'Zari', 'Zardosi', 'Resham', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work', 'Kalamkari', 'Bandhani', 'Leheriya', 'Patola', 'Paithani', 'Baluchari', 'Dhakai', 'Jamdani', 'Khesh', 'Muga', 'Eri', 'Mysore', 'Uppada', 'Gadwal', 'Venkatagiri', 'Narayanpet', 'Bomkai', 'Sambalpuri', 'Khandua', 'Kotpad', 'Bhagalpur', 'Tussar', 'Muga', 'Eri', 'Mysore Silk', 'Kanchipuram', 'Kanjivaram', 'Banarasi Silk', 'Chanderi', 'Maheshwari', 'Kota Doria', 'Gota Work', 'Zari Work', 'Zardosi Work', 'Resham Work'];
  
  // Extract unique values from products based on type
  const availableBrands = React.useMemo(() => {
    const brandSet = new Set();
    products.forEach(product => {
      const brand = product.product_info?.brand || product.brand;
      if (brand && typeof brand === 'string') brandSet.add(brand.trim());
    });
    return Array.from(brandSet).sort();
  }, [products]);
  
  const availableShoeMaterials = React.useMemo(() => {
    const materialSet = new Set();
    products.forEach(product => {
      const material = product.product_info?.shoeMaterial || product.product_info?.material;
      if (material && typeof material === 'string') {
        material.split(',').forEach(m => {
          const trimmed = m.trim();
          if (trimmed) materialSet.add(trimmed);
        });
      }
    });
    return Array.from(materialSet).sort();
  }, [products]);
  
  const availableShoeTypes = React.useMemo(() => {
    const typeSet = new Set();
    products.forEach(product => {
      const type = product.product_info?.footwearType || product.product_info?.shoeType;
      if (type && typeof type === 'string') typeSet.add(type.trim());
    });
    return Array.from(typeSet).sort();
  }, [products]);
  
  const availableSizes = React.useMemo(() => {
    const sizeSet = new Set();
    products.forEach(product => {
      const sizes = product.product_info?.availableSizes || [];
      if (Array.isArray(sizes)) {
        sizes.forEach(size => {
          if (size) sizeSet.add(String(size).trim());
        });
      }
    });
    return Array.from(sizeSet).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [products]);
  
  const availableWatchMovements = React.useMemo(() => {
    const movementSet = new Set();
    products.forEach(product => {
      const movement = product.product_info?.movementType;
      if (movement && typeof movement === 'string') movementSet.add(movement.trim());
    });
    return Array.from(movementSet).sort();
  }, [products]);
  
  const availableWatchCaseMaterials = React.useMemo(() => {
    const materialSet = new Set();
    products.forEach(product => {
      const material = product.product_info?.caseMaterial;
      if (material && typeof material === 'string') {
        material.split(',').forEach(m => {
          const trimmed = m.trim();
          if (trimmed) materialSet.add(trimmed);
        });
      }
    });
    return Array.from(materialSet).sort();
  }, [products]);
  
  const availableWatchBandMaterials = React.useMemo(() => {
    const materialSet = new Set();
    products.forEach(product => {
      const material = product.product_info?.bandMaterial;
      if (material && typeof material === 'string') {
        material.split(',').forEach(m => {
          const trimmed = m.trim();
          if (trimmed) materialSet.add(trimmed);
        });
      }
    });
    return Array.from(materialSet).sort();
  }, [products]);
  
  const availableWaterResistance = React.useMemo(() => {
    const wrSet = new Set();
    products.forEach(product => {
      const wr = product.product_info?.waterResistance;
      if (wr && typeof wr === 'string') wrSet.add(wr.trim());
    });
    return Array.from(wrSet).sort();
  }, [products]);
  
  // Available fabric options (for non-shoe/watch products)
  const availableFabrics = React.useMemo(() => {
    if (isShoesCategory || isWatchCategory) return [];
    const fabricSet = new Set();
    products.forEach(product => {
      const material = product.product_info?.fabric || product.product_info?.material;
      if (material && typeof material === 'string') {
        material.split(',').forEach(m => {
          const trimmed = m.trim();
          if (trimmed && allPossibleFabrics.some(f => trimmed.toLowerCase().includes(f.toLowerCase()))) {
            fabricSet.add(trimmed);
          }
        });
      }
    });
    return Array.from(fabricSet).sort();
  }, [products, isShoesCategory, isWatchCategory]);
  
  const priceRanges = [
    { id: 1, label: '₹300 - ₹1,000', min: 300, max: 1000 },
    { id: 2, label: '₹1,001 - ₹2,000', min: 1001, max: 2000 },
    { id: 3, label: '₹2,001 - ₹3,000', min: 2001, max: 3000 },
    { id: 4, label: '₹3,001 - ₹4,000', min: 3001, max: 4000 },
    { id: 5, label: '₹4,001 - ₹5,000', min: 4001, max: 5000 },
    { id: 6, label: '₹5,001 - ₹6,000', min: 5001, max: 6000 },
    { id: 7, label: '₹6,001 - ₹7,000', min: 6001, max: 7000 },
    { id: 8, label: '₹7,001 - ₹8,000', min: 7001, max: 8000 },
    { id: 9, label: '₹8,001 - ₹10,000', min: 8001, max: 10000 },
    { id: 10, label: 'Above ₹10,000', min: 10001, max: Infinity },
  ];
  
  // Fetch products
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Clear products immediately when category changes
        setProducts([]);
        setFilteredProducts([]);
        setDisplayCount(20); // Reset to initial 20 products when category changes
        
        // Use subcategory if available, otherwise use category
        // Convert to lowercase with hyphens for API endpoint matching
        const apiCategory = effectiveCategory ? effectiveCategory.toLowerCase().replace(/\s+/g, '-') : null;
        const apiSubCategory = effectiveSubCategory || null;
        
        console.log('ProductList - Fetching products:', {
          effectiveCategory,
          effectiveSubCategory,
          apiCategory,
          apiSubCategory,
          categoryName,
          subCategoryName
        });
        const data = await fetchSarees(apiCategory || effectiveCategory, apiSubCategory);
        console.log('ProductList - Received products:', data?.length || 0);
        setProducts(Array.isArray(data) ? data : []);
        setFilteredProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [effectiveCategory, effectiveSubCategory]);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    // Filter by price range (always available)
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.id === selectedPriceRange);
      if (range) {
        result = result.filter(p => {
          const price = p.price || (p.mrp - p.mrp * ((p.discountPercent || 0) / 100));
          return price >= range.min && price <= range.max;
        });
      }
    }
    
    // Filter by brand (common for shoes and watches)
    if (selectedBrands.length > 0) {
      result = result.filter(p => {
        const brand = (p.product_info?.brand || p.brand || '').trim();
        return selectedBrands.some(selectedBrand => 
          brand.toLowerCase() === selectedBrand.toLowerCase()
        );
      });
    }
    
    // Shoes-specific filters
    if (isShoesCategory) {
      // Filter by shoe material
      if (selectedShoeMaterials.length > 0) {
        result = result.filter(p => {
          const material = (p.product_info?.shoeMaterial || p.product_info?.material || '').toLowerCase();
          return selectedShoeMaterials.some(selectedMaterial => 
            material.includes(selectedMaterial.toLowerCase())
          );
        });
      }
      
      // Filter by shoe type
      if (selectedShoeTypes.length > 0) {
        result = result.filter(p => {
          const type = (p.product_info?.footwearType || p.product_info?.shoeType || '').trim();
          return selectedShoeTypes.some(selectedType => 
            type.toLowerCase() === selectedType.toLowerCase()
          );
        });
      }
      
      // Filter by size
      if (selectedSizes.length > 0) {
        result = result.filter(p => {
          const sizes = p.product_info?.availableSizes || [];
          return selectedSizes.some(selectedSize => 
            sizes.some(size => String(size).trim() === selectedSize.trim())
          );
        });
      }
    }
    
    // Watches-specific filters
    if (isWatchCategory) {
      // Filter by movement type
      if (selectedWatchMovements.length > 0) {
        result = result.filter(p => {
          const movement = (p.product_info?.movementType || '').trim();
          return selectedWatchMovements.some(selectedMovement => 
            movement.toLowerCase() === selectedMovement.toLowerCase()
          );
        });
      }
      
      // Filter by case material
      if (selectedWatchCaseMaterials.length > 0) {
        result = result.filter(p => {
          const material = (p.product_info?.caseMaterial || '').toLowerCase();
          return selectedWatchCaseMaterials.some(selectedMaterial => 
            material.includes(selectedMaterial.toLowerCase())
          );
        });
      }
      
      // Filter by band material
      if (selectedWatchBandMaterials.length > 0) {
        result = result.filter(p => {
          const material = (p.product_info?.bandMaterial || '').toLowerCase();
          return selectedWatchBandMaterials.some(selectedMaterial => 
            material.includes(selectedMaterial.toLowerCase())
          );
        });
      }
      
      // Filter by water resistance
      if (selectedWaterResistance.length > 0) {
        result = result.filter(p => {
          const wr = (p.product_info?.waterResistance || '').trim();
          return selectedWaterResistance.some(selectedWR => 
            wr.toLowerCase() === selectedWR.toLowerCase()
          );
        });
      }
    }
    
    // Filter by fabric (for non-shoe/watch products)
    if (!isShoesCategory && !isWatchCategory && selectedFabrics.length > 0) {
      result = result.filter(p => {
        const material = (p.product_info?.fabric || p.product_info?.material || '').toLowerCase();
        return selectedFabrics.some(fabric => 
          material.includes(fabric.toLowerCase())
        );
      });
    }
    
    setFilteredProducts(result);
    // Reset display count when filters change
    setDisplayCount(20);
  }, [
    products, 
    selectedPriceRange, 
    selectedFabrics, 
    selectedBrands,
    selectedShoeMaterials,
    selectedShoeTypes,
    selectedSizes,
    selectedWatchMovements,
    selectedWatchCaseMaterials,
    selectedWatchBandMaterials,
    selectedWaterResistance,
    isShoesCategory,
    isWatchCategory
  ]);
  
  const toggleFabric = (fabric) => {
    setSelectedFabrics(prev => 
      prev.includes(fabric)
        ? prev.filter(f => f !== fabric)
        : [...prev, fabric]
    );
  };
  
  const resetFilters = () => {
    setSelectedPriceRange(null);
    setSelectedFabrics([]);
    setSelectedBrands([]);
    setSelectedShoeMaterials([]);
    setSelectedShoeTypes([]);
    setSelectedSizes([]);
    setSelectedWatchMovements([]);
    setSelectedWatchCaseMaterials([]);
    setSelectedWatchBandMaterials([]);
    setSelectedWaterResistance([]);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

    
  // Scroll to top whenever category changes so the heading/top section is visible
  useEffect(() => {
    // Small delay to ensure page has rendered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [categoryName, subCategoryName, mainCategory]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (loading || filteredProducts.length === 0 || displayCount >= filteredProducts.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !loadingMore && displayCount < filteredProducts.length) {
          setLoadingMore(true);
          // Simulate a small delay for smooth loading
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + 20, filteredProducts.length));
            setLoadingMore(false);
          }, 300);
        }
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before reaching the bottom
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, filteredProducts.length, displayCount, loadingMore]);

  const handleCardClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const activeFilterCount = [
    selectedFabrics.length,
    selectedBrands.length,
    selectedShoeMaterials.length,
    selectedShoeTypes.length,
    selectedSizes.length,
    selectedWatchMovements.length,
    selectedWatchCaseMaterials.length,
    selectedWatchBandMaterials.length,
    selectedWaterResistance.length,
    selectedPriceRange ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <FaFilter className="text-black" />
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <button 
            onClick={resetFilters}
            className="text-sm text-black px-4 py-1.5 rounded-lg border-2 border-black font-medium transition-all shadow-sm"
            style={{ backgroundColor: headerColor }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-gray-200 pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full mb-4 group"
        >
          <h4 className="text-base font-semibold text-black transition-colors">Price Range</h4>
          <div className="flex items-center gap-2">
            {selectedPriceRange && (
              <span className="inline-flex items-center justify-center h-5 w-5 bg-black text-white text-xs font-bold rounded-full">
                ✓
              </span>
            )}
            {openSections.price ? (
              <FaChevronUp className="text-black transition-transform" />
            ) : (
              <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
            )}
          </div>
        </button>
        
        {openSections.price && (
          <div className="space-y-2.5">
            {priceRanges.map(range => (
              <div key={range.id} className="flex items-center group">
                <input
                  type="radio"
                  id={`price-${range.id}`}
                  name="priceRange"
                  checked={selectedPriceRange === range.id}
                  onChange={() => setSelectedPriceRange(range.id)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 cursor-pointer"
                />
                <label 
                  htmlFor={`price-${range.id}`} 
                  className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                    selectedPriceRange === range.id 
                      ? 'bg-gray-100 text-black font-medium' 
                      : 'text-black hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Brand Filter (for Shoes and Watches) */}
      {(isShoesCategory || isWatchCategory) && availableBrands.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <button
            onClick={() => toggleSection('brand')}
            className="flex justify-between items-center w-full mb-4 group"
          >
            <h4 className="text-base font-semibold text-black transition-colors">Brand</h4>
            <div className="flex items-center gap-2">
              {selectedBrands.length > 0 && (
                <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                  {selectedBrands.length}
                </span>
              )}
              {openSections.brand ? (
                <FaChevronUp className="text-black transition-transform" />
              ) : (
                <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
              )}
            </div>
          </button>
          
          {openSections.brand && (
            <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {availableBrands.map(brand => (
                <div key={brand} className="flex items-center group">
                  <input
                    type="checkbox"
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => setSelectedBrands(prev => 
                      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                    )}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                  />
                  <label 
                    htmlFor={`brand-${brand}`} 
                    className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                      selectedBrands.includes(brand)
                        ? 'bg-gray-100 text-black font-medium'
                        : 'text-black hover:bg-gray-50'
                    }`}
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shoe-specific Filters */}
      {isShoesCategory && (
        <>
          {/* Shoe Material Filter */}
          {availableShoeMaterials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('material')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Material</h4>
                <div className="flex items-center gap-2">
                  {selectedShoeMaterials.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedShoeMaterials.length}
                    </span>
                  )}
                  {openSections.material ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.material && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableShoeMaterials.map(material => (
                    <div key={material} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`shoe-material-${material}`}
                        checked={selectedShoeMaterials.includes(material)}
                        onChange={() => setSelectedShoeMaterials(prev => 
                          prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`shoe-material-${material}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedShoeMaterials.includes(material)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shoe Type Filter */}
          {availableShoeTypes.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('type')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Type</h4>
                <div className="flex items-center gap-2">
                  {selectedShoeTypes.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedShoeTypes.length}
                    </span>
                  )}
                  {openSections.type ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.type && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableShoeTypes.map(type => (
                    <div key={type} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`shoe-type-${type}`}
                        checked={selectedShoeTypes.includes(type)}
                        onChange={() => setSelectedShoeTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`shoe-type-${type}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedShoeTypes.includes(type)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Size Filter */}
          {availableSizes.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('size')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Size</h4>
                <div className="flex items-center gap-2">
                  {selectedSizes.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedSizes.length}
                    </span>
                  )}
                  {openSections.size ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.size && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableSizes.map(size => (
                    <div key={size} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onChange={() => setSelectedSizes(prev => 
                          prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`size-${size}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Watch-specific Filters */}
      {isWatchCategory && (
        <>
          {/* Movement Type Filter */}
          {availableWatchMovements.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('movement')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Movement Type</h4>
                <div className="flex items-center gap-2">
                  {selectedWatchMovements.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedWatchMovements.length}
                    </span>
                  )}
                  {openSections.movement ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.movement && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableWatchMovements.map(movement => (
                    <div key={movement} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`movement-${movement}`}
                        checked={selectedWatchMovements.includes(movement)}
                        onChange={() => setSelectedWatchMovements(prev => 
                          prev.includes(movement) ? prev.filter(m => m !== movement) : [...prev, movement]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`movement-${movement}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedWatchMovements.includes(movement)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {movement}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Case Material Filter */}
          {availableWatchCaseMaterials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('caseMaterial')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Case Material</h4>
                <div className="flex items-center gap-2">
                  {selectedWatchCaseMaterials.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedWatchCaseMaterials.length}
                    </span>
                  )}
                  {openSections.caseMaterial ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.caseMaterial && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableWatchCaseMaterials.map(material => (
                    <div key={material} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`case-material-${material}`}
                        checked={selectedWatchCaseMaterials.includes(material)}
                        onChange={() => setSelectedWatchCaseMaterials(prev => 
                          prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`case-material-${material}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedWatchCaseMaterials.includes(material)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Band Material Filter */}
          {availableWatchBandMaterials.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('bandMaterial')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Band Material</h4>
                <div className="flex items-center gap-2">
                  {selectedWatchBandMaterials.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedWatchBandMaterials.length}
                    </span>
                  )}
                  {openSections.bandMaterial ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.bandMaterial && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableWatchBandMaterials.map(material => (
                    <div key={material} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`band-material-${material}`}
                        checked={selectedWatchBandMaterials.includes(material)}
                        onChange={() => setSelectedWatchBandMaterials(prev => 
                          prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`band-material-${material}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedWatchBandMaterials.includes(material)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Water Resistance Filter */}
          {availableWaterResistance.length > 0 && (
            <div className="border-b border-gray-200 pb-6">
              <button
                onClick={() => toggleSection('waterResistance')}
                className="flex justify-between items-center w-full mb-4 group"
              >
                <h4 className="text-base font-semibold text-black transition-colors">Water Resistance</h4>
                <div className="flex items-center gap-2">
                  {selectedWaterResistance.length > 0 && (
                    <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                      {selectedWaterResistance.length}
                    </span>
                  )}
                  {openSections.waterResistance ? (
                    <FaChevronUp className="text-black transition-transform" />
                  ) : (
                    <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
                  )}
                </div>
              </button>
              
              {openSections.waterResistance && (
                <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {availableWaterResistance.map(wr => (
                    <div key={wr} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`water-resistance-${wr}`}
                        checked={selectedWaterResistance.includes(wr)}
                        onChange={() => setSelectedWaterResistance(prev => 
                          prev.includes(wr) ? prev.filter(w => w !== wr) : [...prev, wr]
                        )}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                      />
                      <label 
                        htmlFor={`water-resistance-${wr}`} 
                        className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                          selectedWaterResistance.includes(wr)
                            ? 'bg-gray-100 text-black font-medium'
                            : 'text-black hover:bg-gray-50'
                        }`}
                      >
                        {wr}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Fabric Filter (for non-shoe/watch products) */}
      {!isShoesCategory && !isWatchCategory && availableFabrics.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <button
            onClick={() => toggleSection('material')}
            className="flex justify-between items-center w-full mb-4 group"
          >
            <h4 className="text-base font-semibold text-black transition-colors">Fabric</h4>
            <div className="flex items-center gap-2">
              {selectedFabrics.length > 0 && (
                <span className="inline-flex items-center justify-center h-6 w-6 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                  {selectedFabrics.length}
                </span>
              )}
              {openSections.material ? (
                <FaChevronUp className="text-black transition-transform" />
              ) : (
                <FaChevronDown className="text-gray-400 group-hover:text-black transition-colors" />
              )}
            </div>
          </button>
          
          {openSections.material && (
            <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {availableFabrics.map(material => (
                <div key={material} className="flex items-center group">
                  <input
                    type="checkbox"
                    id={`material-${material}`}
                    checked={selectedFabrics.includes(material)}
                    onChange={() => toggleFabric(material)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
                  />
                  <label 
                    htmlFor={`material-${material}`} 
                    className={`ml-3 text-sm cursor-pointer flex-1 py-1.5 px-3 rounded-md transition-all ${
                      selectedFabrics.includes(material)
                        ? 'bg-gray-100 text-black font-medium'
                        : 'text-black hover:bg-gray-50'
                    }`}
                  >
                    {material}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ position: 'relative', overflowX: 'hidden' }}>
      <style>{styles}</style>
      {loading && (
        <div className="fixed left-0 right-0 top-0 z-50">
          <div className="h-1 bg-black relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Modern Header */}
        <div className="mb-2 sm:mb-4">
          <div className="flex flex-col items-center text-center mb-2 sm:mb-3">
            <h1 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1 sm:mb-2 uppercase text-black"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '2px',
              }}
            >
              {effectiveSubCategory
                ? effectiveSubCategory
                : (effectiveCategory
                    ? effectiveCategory
                    : 'All Products')}
            </h1>
            <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-black rounded-full shadow-sm"></div>
            <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base hidden sm:block">
              Discover our premium collection
            </p>
          </div>
        </div>

        <div ref={filterContainerRef} className="flex gap-6 lg:gap-8 relative filter-sticky-container" style={{ position: 'relative', overflow: 'visible' }}>
          {/* Desktop Sidebar Filters - Sticky below navbar */}
          <aside className="hidden lg:block w-72 flex-shrink-0" style={{ alignSelf: 'flex-start', position: 'relative' }}>
            <div 
              ref={filterSidebarRef}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-y-auto custom-scrollbar filter-sticky-sidebar"
              style={{ 
                position: 'sticky',
                top: `${navbarHeight}px`,
                maxHeight: `calc(100vh - ${navbarHeight}px)`,
                zIndex: 40,
                marginTop: 0
              }}
            >
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button & Active Filters */}
            <div className="lg:hidden mb-3 space-y-2">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-black hover:border-black hover:bg-gray-100 shadow-sm hover:shadow-md transition-all text-sm"
              >
                <FaFilter className="text-black text-sm" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-black text-white text-xs font-bold rounded-full shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active Filters Pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {selectedPriceRange && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {priceRanges.find(r => r.id === selectedPriceRange)?.label}
                      <button 
                        onClick={() => setSelectedPriceRange(null)}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  
                  {(customPriceFrom || customPriceTo) && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      ₹{customPriceFrom || '0'}-₹{customPriceTo || '∞'}
                      <button 
                        onClick={() => {
                          setCustomPriceFrom('');
                          setCustomPriceTo('');
                        }}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  
                  {selectedBrands.map(brand => (
                    <span key={brand} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {brand}
                      <button 
                        onClick={() => setSelectedBrands(prev => prev.filter(b => b !== brand))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedShoeMaterials.map(material => (
                    <span key={material} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {material}
                      <button 
                        onClick={() => setSelectedShoeMaterials(prev => prev.filter(m => m !== material))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedShoeTypes.map(type => (
                    <span key={type} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {type}
                      <button 
                        onClick={() => setSelectedShoeTypes(prev => prev.filter(t => t !== type))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedSizes.map(size => (
                    <span key={size} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      Size {size}
                      <button 
                        onClick={() => setSelectedSizes(prev => prev.filter(s => s !== size))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedWatchMovements.map(movement => (
                    <span key={movement} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {movement}
                      <button 
                        onClick={() => setSelectedWatchMovements(prev => prev.filter(m => m !== movement))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedWatchCaseMaterials.map(material => (
                    <span key={material} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {material}
                      <button 
                        onClick={() => setSelectedWatchCaseMaterials(prev => prev.filter(m => m !== material))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedWatchBandMaterials.map(material => (
                    <span key={material} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {material}
                      <button 
                        onClick={() => setSelectedWatchBandMaterials(prev => prev.filter(m => m !== material))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedWaterResistance.map(wr => (
                    <span key={wr} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {wr}
                      <button 
                        onClick={() => setSelectedWaterResistance(prev => prev.filter(w => w !== wr))}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedFabrics.map(fabric => (
                    <span key={fabric} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-black border border-black">
                      {fabric}
                      <button 
                        onClick={() => toggleFabric(fabric)}
                        className="ml-1.5 hover:scale-110 transition-transform"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modern Results Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-8 bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md border border-gray-100">
              <p className="text-sm sm:text-base text-gray-700">
                Showing <span className="font-bold text-gray-900 text-base sm:text-lg">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <label htmlFor="sort" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Sort:</label>
                <select 
                  id="sort" 
                  className="text-xs sm:text-sm border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:ring-2 focus:ring-black focus:border-black bg-white font-medium text-black cursor-pointer transition-all hover:border-black"
                  onChange={(e) => {
                    const sorted = [...filteredProducts];
                    switch(e.target.value) {
                      case 'price-low-high':
                        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                        break;
                      case 'price-high-low':
                        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                        break;
                      case 'newest':
                        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                        break;
                      default:
                        break;
                    }
                    setFilteredProducts(sorted);
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
            
            {/* Product Grid */}
            {loading ? (
              <div className="relative min-h-[500px] flex items-center justify-center">
                {/* Modern Loading Spinner */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">Loading products...</p>
                  <p className="text-gray-500 text-sm">Please wait while we fetch the best products for you</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                {activeFilterCount > 0 ? (
                  <>
                    <div className="mb-6">
                      <svg className="mx-auto h-20 w-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700 text-xl font-semibold mb-2">No products found</p>
                      <p className="text-gray-500">Try adjusting your filters to see more results</p>
                    </div>
                    <button
                      onClick={resetFilters}
                      className="px-8 py-3 text-black rounded-xl border-2 border-black font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      style={{ backgroundColor: headerColor }}
                    >
                      Clear all filters
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <svg className="mx-auto h-20 w-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-700 text-xl font-semibold mb-2">No products available</p>
                      <p className="text-gray-500 mb-1">Check back soon for new arrivals!</p>
                    </div>
                    <Link
                      to="/"
                      className="inline-block px-8 py-3 text-black rounded-xl border-2 border-black font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      style={{ backgroundColor: headerColor }}
                    >
                      Continue Shopping
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-5 lg:gap-6">
                  {filteredProducts.slice(0, displayCount).map((p) => (
                  <div
                    key={p._id || p.title}
                    className="group bg-white overflow-hidden rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-black transform hover:-translate-y-1 sm:hover:-translate-y-2"
                    onClick={() => handleCardClick(p)}
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={getProductImage(p, 'image1')}
                        alt={p.title}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeholders.productList;
                        }}
                        loading="lazy"
                      />
                      {(p.discountPercent > 0 || p.discount) && (
                        <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg shadow-md sm:shadow-lg uppercase">
                          {p.discountPercent || p.discount}% OFF
                        </span>
                      )}
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="relative p-3 sm:p-4 md:p-5 bg-white">
                      {/* Accent bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      
                      <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <h3 className="text-xs font-semibold text-black uppercase tracking-wide line-clamp-1">
                          {p.product_info?.manufacturer || 'VARNICRAFTS'}
                        </h3>
                      </div>
                      
                      <p className="text-sm sm:text-base font-bold text-black line-clamp-2 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] transition-colors">
                        {p.title || 'Untitled Product'}
                      </p>
                
                      <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                        <div className="flex items-center">
                          <FaRupeeSign className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                          <span className="text-lg sm:text-xl font-bold text-black ml-0.5">
                            {p.price?.toLocaleString() || Math.round(p.mrp - p.mrp * ((p.discountPercent || 0) / 100)).toLocaleString()}
                          </span>
                        </div>
                        {p.mrp && p.mrp > (p.price || 0) && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">
                            ₹{p.mrp.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                
                {/* Infinite Scroll Sentinel & Loading Indicator */}
                {filteredProducts.length > displayCount && (
                  <div ref={loadMoreRef} className="flex justify-center items-center py-8 sm:py-12">
                    {loadingMore && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                        <p className="text-gray-600 font-medium text-sm">Loading more products...</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* End of products indicator */}
                {displayCount >= filteredProducts.length && filteredProducts.length > 0 && (
                  <div className="flex justify-center items-center py-8 sm:py-12">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm font-medium">
                        You've reached the end of the products
                      </p>
                      <div className="w-24 h-0.5 bg-black mx-auto mt-2"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modern Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowMobileFilters(false)}
          ></div>
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl overflow-y-auto custom-scrollbar animate-in slide-in-from-right">
            {/* Header */}
            <div className="sticky top-0 bg-black px-6 py-5 flex justify-between items-center z-10 shadow-lg">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaFilter className="text-white" />
                Filters
              </h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            {/* Filter Content */}
            <div className="p-6">
              <FilterContent />
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t-2 border-gray-100 px-6 py-5 shadow-2xl">
              <div className="mb-3 text-center">
                <span className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900 text-lg">{filteredProducts.length}</span> products found
                </span>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full px-6 py-4 text-black font-bold rounded-xl border-2 border-black transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                style={{ backgroundColor: headerColor }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      <ScrollToTop />
    </div>
  );
};

export default ProductList;