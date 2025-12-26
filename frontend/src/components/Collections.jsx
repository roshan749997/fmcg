import React from 'react';
import { useNavigate } from 'react-router-dom';

const Collections = () => {
  const collections = [
    // Shoes Collections
    { title: 'Men\'s Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761997162/unnamed_m26syz.jpg' },
    { title: 'Women\'s Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761996662/unnamed_nweur7.jpg' },
    { title: 'Sports Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761994621/Gemini_Generated_Image_ypuu4gypuu4gypuu_jgplbq.png' },
    { title: 'Sneakers', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761990540/kanjivaram_sarees_pva3cp.png' },
    { title: 'Casual Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761993746/Block_Printed_Cotton_Saree_zrlik4.png' },
    { title: 'Formal Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761991964/Kalamkari_print_saree_uvhwhn.png' },
    { title: 'Boots', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761993092/Jaipur_Cotton_Saree_c4ccke.png' },
    { title: 'Running Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761990705/banarasi_Silk_sarees_epyjj6.png' },
    { title: 'Walking Shoes', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761991095/dark_green_maheshwarisilk_j9ucs1.png' },
    { title: 'Sandals', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761991311/raw_silk_saree_gtxu2q.png' },
    // Watches Collections
    { title: 'Men\'s Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761991488/Mysore_silk_saree_zwuo1o.png' },
    { title: 'Women\'s Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761991818/Sambalpuri_silk_saree_sezvhm.png' },
    { title: 'Smart Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761992179/Bengali_cotton_saree_ghyp46.png' },
    { title: 'Luxury Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761992993/Maheshwari_Cotton_Saree_hhsdzs.png' },
    { title: 'Sports Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761993328/South_Cotton_Saree_gmvokv.png' },
    { title: 'Analog Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761990337/Gemini_Generated_Image_3yz9wj3yz9wj3yz9_jr5cy8.png' },
    { title: 'Digital Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761993662/Dr._Khadi_Cotton_Saree_iif3wn.png' },
    { title: 'Fitness Trackers', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761993480/office_wear_cotton_saree_pzlnyb.png' },
    { title: 'Chronograph Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761994151/Bagru_Print_Cotton_Saree_ibrwzw.png' },
    { title: 'Classic Watches', image: 'https://res.cloudinary.com/duc9svg7w/image/upload/v1761994342/Ajrakh_Print_Cotton_Saree_vcfkoa.png' },
  ];

  const navigate = useNavigate();

  // Map each card title to the exact route defined in Navbar.jsx
  const pathByTitle = {
    // Shoes
    'Men\'s Shoes': '/category/shoes/mens-shoes',
    'Women\'s Shoes': '/category/shoes/womens-shoes',
    'Sports Shoes': '/category/shoes/sports-shoes',
    'Sneakers': '/category/shoes/sneakers',
    'Casual Shoes': '/category/shoes/casual-shoes',
    'Formal Shoes': '/category/shoes/formal-shoes',
    'Boots': '/category/shoes/boots',
    'Running Shoes': '/category/shoes/running-shoes',
    'Walking Shoes': '/category/shoes/walking-shoes',
    'Sandals': '/category/shoes/sandals',
    // Watches
    'Men\'s Watches': '/category/watches/mens-watches',
    'Women\'s Watches': '/category/watches/womens-watches',
    'Smart Watches': '/category/watches/smart-watches',
    'Luxury Watches': '/category/watches/luxury-watches',
    'Sports Watches': '/category/watches/sports-watches',
    'Analog Watches': '/category/watches/analog-watches',
    'Digital Watches': '/category/watches/digital-watches',
    'Fitness Trackers': '/category/watches/fitness-trackers',
    'Chronograph Watches': '/category/watches/chronograph-watches',
    'Classic Watches': '/category/watches/classic-watches',
  };

  const onCardClick = (title) => {
    const path = pathByTitle[title];
    if (path) navigate(path);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-light text-gray-800 tracking-wide mb-3">
            CHOOSE YOUR SHOES & WATCHES
          </h2>
          <p className="text-gray-500 text-sm">Discover our exclusive collection of premium shoes and watches</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100"
              onClick={() => onCardClick(item.title)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <div className="p-4 bg-white">
                <h3 className="text-sm font-medium tracking-wide text-gray-800 text-center">
                  {item.title}
                </h3>
              </div>
              
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7A2A2A] via-[#A56E2C] to-[#C89D4B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
