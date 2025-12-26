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
            desktop: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765533980/Cream_Green_Playful_Kids_Fashion_Trends_Twitter_Header_2048_x_594_px_jsjjsh.png',
            alt: 'Kidzo - Premium Kids & Baby Products Collection',
          },
          {
            desktop: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765533979/Green_Cute_Baby_Store_Facebook_Ads_2048_x_594_px_tiow9i.svg',
            alt: 'Festive Season Offer - Kidzo',
          },
        ]}
        mobileSrc="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1765533983/Beige_Neutral_Kids_Fashion_Product_Detail_Instagram_Post_obnvdg.svg"
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
