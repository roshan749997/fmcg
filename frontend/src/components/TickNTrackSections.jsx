import React, { useState } from 'react';
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
        name: 'Cloths', 
        icon: '🚴‍♂️', 
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538765/unnamed_yt1lzi.jpg', 
        path: '/category/kids-clothing' 
      },
      { 
        name: 'Winterwear', 
        icon: '🚙', 
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538871/unnamed_t9cus4.jpg', 
        path: '/category/kids-clothing/winterwear' 
      },
      { 
        name: 'Kids Accessories', 
        icon: '🚛', 
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538873/unnamed_cus3wx.jpg', 
        path: '/category/kids-accessories' 
      },
      { 
        name: 'Footwear', 
        icon: '🚜', 
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538961/unnamed_hqycjk.jpg', 
        path: '/category/footwear' 
      },
      { 
        name: 'Baby Care', 
        icon: '🏎️', 
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538964/unnamed_fn6esy.jpg', 
        path: '/category/baby-care' 
      },
      { 
        name: 'Toys', 
        icon: '🔥', 
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765539006/unnamed_vlrbtq.jpg', 
        path: '/category/toys' 
      }
    ];

    return (
      <section 
        className="py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#E6D9F2' }}
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
              SHOP BY CATEGORY
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-2 sm:px-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group cursor-pointer"
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
      </section>
    );
  };

  // Offer Zone Section
  const FeaturedSection = () => {
    const offers = [
      {
        id: 1,
        badge: 'Limited Time',
        title: '20%',
        subtitle: 'OFF',
        description: 'Limited Stock',
        text: 'Grab your favorite products before they run out!',
        buttonText: 'Shop Now →',
        gradient: 'from-pink-500 via-pink-600 to-pink-700',
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538964/unnamed_fn6esy.jpg',
        buttonClass: 'bg-white text-[#02050B] hover:bg-[#02050B] hover:text-white',
        path: '/category/baby-care'
      },
      {
        id: 2,
        badge: 'New Arrival',
        title: 'NEW',
        subtitle: 'Collection',
        description: 'Latest Products',
        text: 'Explore our newest arrivals!',
        buttonText: 'Explore →',
        gradient: 'from-blue-500 via-purple-600 to-blue-700',
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538871/unnamed_t9cus4.jpg',
        path: '/category/kids-clothing/winterwear'
      },
      {
        id: 3,
        badge: 'Special Offer',
        title: 'FREE',
        subtitle: 'Shipping',
        description: 'On Orders Above ₹999',
        text: 'Shop more and save on delivery charges!',
        buttonText: 'Shop Now →',
        gradient: 'from-teal-500 via-green-500 to-teal-600',
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538961/unnamed_hqycjk.jpg',
        buttonClass: 'bg-white text-[#02050B] hover:bg-[#02050B] hover:text-white',
        path: '/category/footwear'
      },
      {
        id: 4,
        badge: 'Hot Deals',
        title: '30%',
        subtitle: 'OFF',
        description: 'Premium Collection',
        text: 'Best deals on premium products!',
        buttonText: 'Shop Now →',
        gradient: 'from-blue-400 via-blue-500 to-blue-600',
        image: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765538765/unnamed_yt1lzi.jpg',
        buttonClass: 'bg-white text-blue-700 hover:bg-blue-50',
        badgeClass: 'bg-blue-300/30',
        path: '/category/kids-clothing'
      }
    ];

    return (
      <section 
        className="py-8 sm:py-10 md:py-12 lg:py-16 px-2 sm:px-4 md:px-6 lg:px-8 w-full" 
        style={{ backgroundColor: '#E6D9F2' }}
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
              OFFER ZONE
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">Limited time offers - Don't miss out!</p>
            <button
              onClick={() => handleCategoryClick('/category/kids-clothing')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Offers →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 px-2 sm:px-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => handleCategoryClick(offer.path)}
                className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${offer.gradient}`}></div>
                <div className="absolute inset-0">
                  <img
                    src={offer.image}
                    alt={offer.badge}
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600/1F2937/FFFFFF?text=Offer';
                    }}
                  />
                </div>
                <div className="relative p-4 sm:p-5 md:p-6 text-white z-10">
                  <div className={`inline-block ${offer.badgeClass || 'bg-white/20'} backdrop-blur-sm px-3 py-1 rounded-full mb-2`}>
                    <span className="text-xs font-bold uppercase tracking-wider">{offer.badge}</span>
                    </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1 leading-none">{offer.title}</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{offer.subtitle}</div>
                  <div className="text-sm sm:text-base mb-2 font-semibold opacity-95">{offer.description}</div>
                  <p className="text-xs sm:text-sm opacity-90 mb-2">{offer.text}</p>
                  <button className={`mt-2 ${offer.buttonClass} px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 transform group-hover:scale-105`}>
                    {offer.buttonText}
                      </button>
                    </div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
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
        style={{ backgroundColor: '#E6D9F2' }}
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
        style={{ backgroundColor: '#E6D9F2' }}
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
        style={{ backgroundColor: '#E6D9F2' }}
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
        style={{ backgroundColor: '#E6D9F2' }}
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
    <div style={{ backgroundColor: '#E6D9F2' }}>
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
