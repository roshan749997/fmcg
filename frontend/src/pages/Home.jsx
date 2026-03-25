import React from 'react';
import Collections from '../components/Collections';
import MobileBottomNav from '../components/MobileBottomNav';
import HeroSlider from '../components/HeroSlider';
import KidzoSections from '../components/TickNTrackSections';
import ScrollToTop from '../components/ScrollToTop';

const Home = () => {
  return (
    <div className="min-h-screen pt-0 pb-16 md:pb-0 mt-0">
      {/* Hero Slider */}
      <HeroSlider
        slides={[
          {
            desktop: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774422260/Red_and_Green_Modern_Beverage_Drink_Instagram_Post_1080_x_1080_px_1920_x_600_px_peybb9.png',
            alt: 'Kidzo - Premium Kids & Baby Products Collection',
          },
          {
            desktop: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774422272/Untitled_1920_x_600_px_16_qkdbcw.png',
            alt: 'Festive Season Offer - Kidzo',
          },
          {
            desktop: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774422686/Banner_Grocery_Delivery_Fresh_Organic_1920_x_600_px_hxivu9.png',
            alt: 'Festive Season Offer - Kidzo',
          },
          {
            desktop: 'https://res.cloudinary.com/dzd47mpdo/image/upload/v1774422896/Yellow_Fast_Food_Fest_Website_Banner_1920_x_600_px_bbseqi.png',
            alt: 'Festive Season Offer - Kidzo',
          },
        ]}
        mobileSrc="https://res.cloudinary.com/dzd47mpdo/image/upload/v1774422686/White_and_Green_Grocery_Store_Instagram_Post_600_x_600_px_e93fw4.png"
      />

      {/* Kidzo Sections */}
      <KidzoSections />

      {/* Featured Collections */}

       
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default Home;
