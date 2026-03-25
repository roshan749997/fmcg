import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaAward, FaShieldAlt, FaUndo } from 'react-icons/fa';

const KidzoSections = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Click Handler Function
  const handleCategoryClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shop by Category Section
  const MainCategories = () => {
    const categories = [
      { 
        name: 'Makeup', 
        icon: '🚴‍♂️', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774432684/6ac06970-96fc-482a-94e7-babf1d959fdc.png', 
        path: '/category/beauty-and-hygiene/makeup' 
      },
      { 
        name: 'Energy & Soft Drinks', 
        icon: '🚛', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774432694/c19b217b-7f16-4b62-9029-cd527b7c1b17.png', 
        path: '/category/beverages/energy-and-soft-drinks' 
      },
      { 
        name: 'Bath & Hand Wash', 
        icon: '🚙', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774423858/8140e669-2bc1-4c63-9f43-ce249342ebc2.png', 
        path: '/category/beauty-and-hygiene/bath-and-hand-wash' 
      },
      { 
        name: 'Tea', 
        icon: '🚜', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774425891/7486c102-b821-4cde-8c58-8f127b79b767.png', 
        path: '/category/beverages/tea' 
      },
      { 
        name: "Men's Grooming", 
        icon: '🏎️', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774425536/a3179ec5-4267-4e39-a412-6e6ceb0ce516.png', 
        path: '/category/beauty-and-hygiene/mens-grooming' 
      },
      { 
        name: 'Hair Care', 
        icon: '🔥', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774425967/3ddf5209-ba06-40f3-8d09-5d6fb3ea362e.png', 
        path: '/category/beauty-and-hygiene/hair-care' 
      },
      { 
        name: 'Fragrances & Deos', 
        icon: '💫', 
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774426135/4501126f-941c-4c6f-9bb8-8adc890de203.png', 
        path: '/category/beauty-and-hygiene/fragrances-and-deos' 
      },
      {
        name: 'Sports & Fitness',
        icon: '🏃‍♂️',
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774432057/e41e6d8b-f963-4abd-b9f7-c619c9ebe8f0.png',
        path: '/category/cleaning-and-household/sports-and-fitness'
      },
      {
        name: 'Toys & Games',
        icon: '🧸',
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774432198/cd1f92b8-dd04-41e6-92ba-2dd38fbcbb16.png',
        path: '/category/cleaning-and-household/toys-and-games'
      },
      {
        name: 'Bins & Bathroom Ware',
        icon: '🧺',
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774432238/f8a94dec-5e6d-48a5-a6af-e75add435ee5.png',
        path: '/category/cleaning-and-household/bins-and-bathroom-ware'
      }
    ];

    const carouselRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const scrollPrev = () => {
      const el = carouselRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const step = el.clientWidth;
      const target = el.scrollLeft - step;
      if (target <= 0) {
        el.scrollLeft = Math.max(0, maxScrollLeft);
      } else {
        el.scrollBy({ left: -step, behavior: 'smooth' });
      }
    };

    const scrollNext = () => {
      const el = carouselRef.current;
      if (!el) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const step = el.clientWidth;
      const target = el.scrollLeft + step;
      if (target >= maxScrollLeft - 1) {
        el.scrollLeft = 0;
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    useEffect(() => {
      const id = window.setInterval(() => {
        if (isPaused) return;
        const el = carouselRef.current;
        if (!el) return;
        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        const step = el.clientWidth;
        const target = el.scrollLeft + step;
        if (target >= maxScrollLeft - 1) el.scrollLeft = 0;
        else el.scrollBy({ left: step, behavior: 'smooth' });
      }, 3000);

      return () => window.clearInterval(id);
    }, [isPaused]);

    return (
      <section 
        className="py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black mb-1 sm:mb-2 uppercase" 
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                letterSpacing: '2px', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
            >
              SHOP BY CATEGORY
            </h2>
          </div>

          <div className="relative px-2 sm:px-4">
            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => {
                setIsPaused(true);
                scrollPrev();
                window.setTimeout(() => setIsPaused(false), 1200);
              }}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next categories"
              onClick={() => {
                setIsPaused(true);
                scrollNext();
                window.setTimeout(() => setIsPaused(false), 1200);
              }}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div
              ref={carouselRef}
              className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto scroll-smooth py-1 hide-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="group cursor-pointer snap-start w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] flex-shrink-0"
                  onClick={() => handleCategoryClick(category.path)}
                >
                  <div className="relative aspect-square bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                    <div className="absolute inset-0 bg-gray-100">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200x200/1F2937/FFFFFF?text=Car';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-center mt-3 text-xs sm:text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#02050B] transition-colors duration-300">
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Offer Zone Section
  const FeaturedSection = () => {
    const offers = [
      {
        id: 1,
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774421048/58017a7a-e5b0-451f-a5e3-4cfeaf120849.png',
        path: '/category/baby-care'
      },
      {
        id: 2,
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774421025/94c73c6e-e976-429e-962a-995e249ce108.png',
        path: '/category/kids-clothing/winterwear'
      },
      {
        id: 3,
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774421010/cad31fe6-8aac-41dd-974d-2fa7f3e615d2.png',
        path: '/category/footwear'
      },
      {
        id: 4,
        image: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774421061/b0e54120-4ec8-4143-b177-25b91ee3d5a7.png',
        path: '/category/kids-clothing'
      }
    ];

    return (
      <section 
        className="py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black mb-1 sm:mb-2 uppercase"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '2px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              OFFER ZONE
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 px-2 sm:px-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => handleCategoryClick(offer.path)}
                className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group cursor-pointer"
              >
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <img
                  src={offer.image}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600/1F2937/FFFFFF?text=Offer';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Premium Collection Section
  const PremiumCollection = () => {
    const productData = [
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765545802/Blue_Pink_and_White_Modern_Kids_Fashion_Instagram_Post_1_jlr5f8.png',
        name: 'Kids Clothing Set',
        path: '/category/kids-clothing'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765547808/unnamed_vaowmm.jpg',
        name: 'Winter Wear Collection',
        path: '/category/kids-clothing/winterwear'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538765/unnamed_yt1lzi.jpg',
        name: 'Girls Fashion Set',
        path: '/category/kids-clothing/girls-cloths'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765546653/unnamed_a17jn6.jpg',
        name: 'Kids Accessories Pack',
        path: '/category/kids-accessories'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538961/unnamed_hqycjk.jpg',
        name: 'Kids Footwear',
        path: '/category/footwear'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538964/unnamed_fn6esy.jpg',
        name: 'Baby Care Essentials',
        path: '/category/baby-care'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765546805/unnamed_ofelua.jpg',
        name: 'Premium Toys',
        path: '/category/toys'
      },
      {
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765547808/unnamed_vaowmm.jpg',
        name: 'Boys Collection',
        path: '/category/kids-clothing/boys-cloth'
      }
    ];

    return (
      <section 
        className="py-6 sm:py-8 md:py-10 lg:py-12 px-1 sm:px-2 md:px-3 lg:px-4 w-full" 
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full">
          <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-4">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center mb-2 sm:mb-3 text-black overflow-hidden uppercase" 
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                letterSpacing: '2px', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
            >
              <span className="inline-block">PREMIUM COLLECTION</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full px-2 sm:px-3 md:px-4">
            {productData.map((product, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(product.path)}
                className="group overflow-hidden rounded-lg sm:rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 w-full cursor-pointer"
              >
                <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x500/1F2937/FFFFFF?text=Product+Image';
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4 md:p-5 bg-[#4A4A4D]">
                  <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg text-center leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Banner Section
  const BannerSection = () => {
    return (
      <section 
        className="py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black mb-2 sm:mb-3 uppercase" 
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                letterSpacing: '2px', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
            >
              SPECIAL COLLECTION
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Discover our exclusive range of premium products</p>
            <button
              onClick={() => handleCategoryClick('/category/kids-accessories')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Explore Collection →
            </button>
          </div>

          <div className="w-full px-2 sm:px-4">
            {/* Mobile Banner */}
            <div 
              onClick={() => handleCategoryClick('/category/kids-accessories')}
              className="relative overflow-hidden rounded-2xl shadow-xl md:hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="w-full">
                <img
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765548837/Beige_Kids_Fashion_Sale_Ad_Instagram_Story_gwokfq.svg"
                  alt="Special Collection Banner"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x800/FEF8DD/000000?text=Banner';
                  }}
                />
              </div>
            </div>
            {/* Desktop Banner */}
            <div 
              onClick={() => handleCategoryClick('/category/kids-accessories')}
              className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl hidden md:block cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]"
            >
              <div className="w-full">
              <img 
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765541014/White_and_Pink_Fashion_Kids_Edition_Banner_1920_x_600_mm_jpmhbs.svg"
                  alt="Special Collection Banner"
                className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/1200x400/FEF8DD/000000?text=Banner';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Why Choose Us Section
  const WhyChooseUs = () => {
    const features = [
      {
        id: 1,
        icon: FaTruck,
        title: 'Fast Delivery',
        description: 'Quick and reliable shipping across India with secure packaging',
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600'
      },
      {
        id: 2,
        icon: FaAward,
        title: 'Premium Quality',
        description: 'Authentic products with superior craftsmanship and attention to detail',
        color: 'yellow',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      {
        id: 3,
        icon: FaShieldAlt,
        title: 'Safe & Certified',
        description: 'All products meet safety standards and are certified for kids',
        color: 'green',
        gradient: 'from-green-500 to-green-600'
      },
      {
        id: 4,
        icon: FaUndo,
        title: 'Easy Returns',
        description: 'Hassle-free return policy within 7 days with full refund guarantee',
        color: 'purple',
        gradient: 'from-purple-500 to-purple-600'
      }
    ];

    const colorMap = {
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500'
    };

    return (
      <section 
        className="py-12 sm:py-16 md:py-20 lg:py-24 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 px-2 sm:px-4">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black mb-3 sm:mb-4 uppercase" 
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                letterSpacing: '2px', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
            >
              WHY CHOOSE US
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Experience the best in premium kids and baby products with unmatched quality and service
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 ${colorMap[feature.color]} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.gradient} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-lg sm:text-xl md:text-2xl text-white" />
                </div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 text-center leading-tight">{feature.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-center leading-snug sm:leading-relaxed">{feature.description}</p>
                </div>
              </div>
              );
            })}
          </div>
          </div>
      </section>
    );
  };

  // Promotional Banners Section
  const PromotionalBanners = () => {
    const banners = [
      {
        id: 1,
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765610052/Pink_and_Yellow_Playful_Kids_Fashion_Sale_Promotion_Landscape_Banner_dl4a3a.svg',
        alt: 'Pink and Yellow Kids Fashion Sale Promotion',
        path: '/category/kids-clothing'
      },
      {
        id: 2,
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765610311/Colorful_Kids_Fashion_Tips_YouTube_Thumbnail_wfyxyn.svg',
        alt: 'Green and Pink Modern Gradient Summer Kids Fashion Banner',
        path: '/category/footwear'
      }
    ];

    return (
      <section 
        className="py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4">
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-black mb-2 sm:mb-3 uppercase" 
              style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                letterSpacing: '2px', 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}
            >
              SPECIAL OFFERS
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Check out our latest promotions and deals</p>
            <button
              onClick={() => handleCategoryClick('/category/toys')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Deals →
            </button>
          </div>

          {/* Mobile Only Banner */}
          <div className="mb-4 md:hidden px-2">
            <div
              onClick={() => handleCategoryClick('/category/toys')}
              className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
            >
              <div className="w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765534235/Blue_Pink_and_White_Modern_Kids_Fashion_Instagram_Post_iye3ee.png"
                  alt="Special Offers Mobile Banner"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x500/E6D9F2/000000?text=Banner';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Desktop Banners - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 px-2 sm:px-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                onClick={() => handleCategoryClick(banner.path)}
                className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group cursor-pointer"
              >
                <div className="w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[2/1] bg-gray-100 overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x400/E6D9F2/000000?text=Banner';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      <MainCategories />
      <FeaturedSection />
      <PremiumCollection />
      <BannerSection />
      <WhyChooseUs />
      <PromotionalBanners />
    </div>
  );
};

export default KidzoSections;
