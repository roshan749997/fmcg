import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Truck, Shield, RotateCcw, HeadphonesIcon, MessageCircle } from 'lucide-react';
import { api } from '../utils/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState({
    email: 'support@kidzo.com',
    phone: '+91 98765 43210',
    address: 'Kidzo Headquarters, 123 Playful Lane, Mumbai, India 400001',
    companyName: 'Kidzo',
  });
  const [footerLogo, setFooterLogo] = useState({
    url: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765609203/2_qw44ed.svg',
    alt: 'Kidzo',
    width: 'auto',
    height: 'auto',
  });

  useEffect(() => {
    loadContactInfo();
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const logo = await api.getLogo('footer').catch(() => null);
      if (logo) {
        setFooterLogo({ 
          url: logo.url, 
          alt: logo.alt || 'Kidzo',
          width: logo.width || 'auto',
          height: logo.height || 'auto',
        });
      }
    } catch (err) {
      console.error('Failed to load footer logo:', err);
    }
  };

  useEffect(() => {
    // Listen for logo updates
    const handleLogoUpdate = (event) => {
      if (event.detail.type === 'footer') {
        loadLogo();
      }
    };
    window.addEventListener('logo:updated', handleLogoUpdate);
    return () => window.removeEventListener('logo:updated', handleLogoUpdate);
  }, []);

  const loadContactInfo = async () => {
    try {
      const data = await api.getContactInfo();
      if (data) {
        setContactInfo(data);
      }
    } catch (err) {
      console.error('Failed to load contact info:', err);
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Offers', path: '/offers' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const categories = [
    { name: 'Kids Clothing', path: '/category/kids-clothing' },
    { name: 'Winter Wear', path: '/category/kids-clothing/winterwear' },
    { name: 'Footwear', path: '/category/footwear' },
    { name: 'Baby Care', path: '/category/baby-care' },
    { name: 'Toys', path: '/category/toys' },
  ];

  const trustFeatures = [
    { icon: Truck, title: 'Free Shipping', description: 'On orders above ₹999' },
    { icon: Shield, title: 'Secure Payment', description: '100% secure transactions' },
    { icon: RotateCcw, title: 'Easy Returns', description: '7-day return policy' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Dedicated customer care' },
  ];

  // Extract phone number without +91 for WhatsApp link
  const whatsappNumber = contactInfo.phone.replace(/[\s\+\-]/g, '').replace(/^91/, '');

  const socialLinks = [
    {
      name: 'Instagram',
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: 'https://instagram.com/kidzo',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: 'https://facebook.com/kidzo',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: `https://wa.me/${whatsappNumber}`,
    },
  ];

  return (
    <>
      <style>{`
        .footer-link {
          color: #1F2937;
          transition: color 0.3s ease;
        }
        .footer-link:hover {
          color: #FF5CA8;
        }
      `}</style>
      <footer className="w-full bg-white" style={{ color: '#1F2937' }}>
      {/* Trust Strip */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6" style={{ background: 'linear-gradient(135deg, rgba(255, 92, 168, 0.1) 0%, rgba(255, 182, 193, 0.1) 100%)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 92, 168, 0.2)' }}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: '#FF5CA8' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h6 className="font-semibold text-xs sm:text-sm md:text-base leading-tight" style={{ color: '#1F2937' }}>{feature.title}</h6>
                  <p className="text-[10px] sm:text-xs md:text-sm opacity-80 leading-tight mt-0.5 sm:mt-1" style={{ color: '#1F2937' }}>{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-4 2xl:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 sm:mb-6">
              <img 
                src={footerLogo.url}
                alt={footerLogo.alt || contactInfo.companyName}
                style={{
                  ...(footerLogo.width !== 'auto' && { width: footerLogo.width }),
                  ...(footerLogo.height !== 'auto' && { height: footerLogo.height }),
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
                className={footerLogo.width === 'auto' && footerLogo.height === 'auto' 
                  ? "h-50 sm:h-60 w-auto object-contain mb-10 sm:mb-4" 
                  : "object-contain mb-10 sm:mb-4"}
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765609203/2_qw44ed.svg';
                }}
              />
              <p className="text-sm sm:text-base leading-relaxed max-w-md opacity-90" style={{ color: '#1F2937' }}>
                Your trusted destination for premium kids & baby products. 
                We bring you the finest collection of clothing, accessories, and toys for your little ones.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 opacity-90" style={{ color: '#1F2937' }}>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" style={{ color: '#FF5CA8' }} />
                <span className="text-sm sm:text-base break-words">{contactInfo.phone}</span>
              </div>
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 opacity-90" style={{ color: '#1F2937' }}>
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" style={{ color: '#FF5CA8' }} />
                <span className="text-sm sm:text-base break-all">{contactInfo.email}</span>
              </div>
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 opacity-90" style={{ color: '#1F2937' }}>
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" style={{ color: '#FF5CA8' }} />
                <span className="text-sm sm:text-base break-words">{contactInfo.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg" style={{ color: '#1F2937' }}>Quick Links</h5>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path}
                    className="footer-link opacity-90 hover:opacity-100 active:opacity-100 transition-all duration-300 flex items-center gap-2 group text-sm sm:text-base touch-manipulation"
                  >
                    <span className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" style={{ backgroundColor: '#FF5CA8' }}></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg" style={{ color: '#1F2937' }}>Categories</h5>
            <ul className="space-y-2 sm:space-y-3">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link 
                    to={category.path}
                    className="footer-link opacity-90 hover:opacity-100 active:opacity-100 transition-all duration-300 flex items-center gap-2 group text-sm sm:text-base touch-manipulation"
                  >
                    <span className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" style={{ backgroundColor: '#FF5CA8' }}></span>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Policy Links Section */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 bg-white">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
          <Link 
            to="/privacy" 
            className="text-sm sm:text-base text-gray-600 hover:text-black transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/terms" 
            className="text-sm sm:text-base text-gray-600 hover:text-black transition-colors duration-200"
          >
            Terms & Conditions
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/shipping" 
            className="text-sm sm:text-base text-gray-600 hover:text-black transition-colors duration-200"
          >
            Shipping Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/refund-cancellation" 
            className="text-sm sm:text-base text-gray-600 hover:text-black transition-colors duration-200"
          >
            Refund/Cancellation Policy
          </Link>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t" style={{ borderColor: 'rgba(229, 231, 235, 0.1)' }}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-4 2xl:px-6 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm opacity-90 text-center sm:text-left" style={{ color: '#1F2937' }}>
              © {currentYear} {contactInfo.companyName}. All Rights Reserved
            </div>
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
                  style={{ 
                    backgroundColor: 'rgba(255, 92, 168, 0.2)',
                    color: '#1F2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF5CA8';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 92, 168, 0.2)';
                    e.currentTarget.style.color = '#1F2937';
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF5CA8';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onTouchEnd={(e) => {
                    setTimeout(() => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 92, 168, 0.2)';
                      e.currentTarget.style.color = '#1F2937';
                    }, 150);
                  }}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
