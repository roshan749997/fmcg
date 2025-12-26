import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MobileHeader = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [dropdownTop, setDropdownTop] = useState(0);
  const categoryRef = useRef(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  // Categories with subcategories (same as Navbar)
  const categories = [
    {
      name: "Kids Clothing",
      path: '/category/kids-clothing',
      subcategories: [
        { name: 'Girls Cloths', path: '/category/kids-clothing/girls-cloths' },
        { name: 'Boys Cloth', path: '/category/kids-clothing/boys-cloth' },
        { name: 'Winterwear', path: '/category/kids-clothing/winterwear' },
      ]
    },
    {
      name: "Kids Accessories",
      path: '/category/kids-accessories',
      subcategories: [
        { name: 'Watches', path: '/category/kids-accessories/watches' },
        { name: 'Sunglasses', path: '/category/kids-accessories/sunglasses' },
      ]
    },
    {
      name: "Footwear",
      path: '/category/footwear',
      subcategories: [
        { name: 'Boys Footwear', path: '/category/footwear/boys-footwear' },
        { name: 'Girls Footwear', path: '/category/footwear/girls-footwear' },
      ]
    },
    {
      name: "Baby Care",
      path: '/category/baby-care',
      subcategories: [
        { name: 'Diapers', path: '/category/baby-care/diapers' },
        { name: 'Wipes', path: '/category/baby-care/wipes' },
        { name: 'Baby Gear', path: '/category/baby-care/baby-gear' },
        { name: 'Baby Proofing & Safety', path: '/category/baby-care/baby-proofing-safety' },
      ]
    },
    {
      name: "Toys",
      path: '/category/toys',
      subcategories: []
    },
  ];

  // Calculate dropdown top position
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setDropdownTop(rect.bottom + 4);
      }
    };
    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on a link or button inside dropdown
      if (event.target.tagName === 'A' || event.target.closest('a') || event.target.tagName === 'BUTTON' || event.target.closest('button')) {
        // Only close if clicking outside the category container
        const isInsideCategory = categoryRef.current && categoryRef.current.contains(event.target);
        const isInsideDropdown = event.target.closest('[data-dropdown]');
        if (!isInsideCategory && !isInsideDropdown) {
          setActiveCategory(null);
        }
        return;
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        const isInsideDropdown = event.target.closest('[data-dropdown]');
        if (!isInsideDropdown) {
          setActiveCategory(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={headerRef} className="md:hidden w-full border-t border-gray-200 border-b border-gray-200 shadow-sm relative" style={{ backgroundColor: '#e7dacf', overflow: 'visible' }}>
        {/* Horizontal Scrollable Categories */}
        <div className="relative px-2 sm:px-3 pt-1.5 sm:pt-2 pb-1 sm:pb-1.5" ref={categoryRef} style={{ overflow: 'visible' }}>
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto hide-scrollbar" style={{ overflowY: 'visible', scrollBehavior: 'smooth' }}>
            {categories.map((category) => (
              <div key={category.name} className="relative group shrink-0" style={{ zIndex: activeCategory === category.name ? 100 : 'auto' }}>
                <div
                  className={`flex items-center font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer whitespace-nowrap px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation ${
                    activeCategory === category.name ? 'bg-gray-50' : ''
                  }`}
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: '0.5px',
                    color: '#000000',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (category.subcategories && category.subcategories.length > 0) {
                      setActiveCategory(activeCategory === category.name ? null : category.name);
                    } else {
                      navigate(category.path);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="whitespace-nowrap">{category.name}</span>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <svg
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 flex-shrink-0 transition-transform duration-300 ${
                        activeCategory === category.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#000000' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdown Portal - Render outside scroll container */}
      {categories.map((category) => (
        activeCategory === category.name && category.subcategories && category.subcategories.length > 0 && (
          <div 
            key={`dropdown-${category.name}`}
            data-dropdown
            className="fixed md:hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300 px-2 sm:px-3"
            style={{ 
              top: `${dropdownTop}px`,
              left: '0',
              right: '0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-xl border border-pink-200 overflow-hidden max-w-[calc(100vw-1rem)] sm:max-w-[320px] mx-auto">
                    {/* Header */}
                    <div className="bg-pink-50 border-b border-pink-200">
                      <button
                        type="button"
                        className="w-full text-left block px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 group touch-manipulation active:bg-pink-100"
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          letterSpacing: '0.5px',
                          color: '#000000',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveCategory(null);
                          navigate(category.path);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <span>All {category.name}</span>
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-auto opacity-60 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Subcategories */}
                    <div className="max-h-[50vh] overflow-y-auto custom-scrollbar py-1 sm:py-2">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.name}
                          type="button"
                          className="w-full text-left block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200 hover:bg-pink-50 active:bg-pink-100 group touch-manipulation"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveCategory(null);
                            navigate(subcategory.path);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-400 group-hover:bg-pink-600 transition-colors"></div>
                            <span 
                              className="font-bold flex-1"
                              style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                letterSpacing: '0.3px',
                                color: '#000000',
                              }}
                            >
                              {subcategory.name}
                            </span>
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
      
      {/* Custom Styles */}
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
      `}</style>
    </>
  );
};

export default MobileHeader;

