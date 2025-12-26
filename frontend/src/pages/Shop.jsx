import ScrollToTop from '../components/ScrollToTop';

const Shop = () => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent">
          Shop Sarees
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Browse through our exquisite collection of traditional and contemporary sarees
        </p>
        
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-xl text-gray-600">Shop page coming soon...</p>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Shop;
