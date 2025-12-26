import { Category } from '../models/Category.js';
import { Product } from '../models/product.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import { KidsClothing } from '../models/KidsClothing.js';
import { Footwear } from '../models/Footwear.js';
import { BabyCare } from '../models/BabyCare.js';
import { Toys } from '../models/Toys.js';

export const getHeaderData = async (req, res) => {
  try {
    // Get all categories for the navigation
    const categories = await Category.find({}, 'name slug -_id').sort({ name: 1 });

    // Mock data for other header elements
    const headerData = {
      logo: {
        url: '/logo.png',
        alt: 'Kidzo Logo'
      },
      navigation: {
        categories: categories,
        links: [
          { name: 'Home', url: '/' },
          { name: 'New Arrivals', url: '/new-arrivals' },
          { name: 'Best Sellers', url: '/best-sellers' },
          { name: 'Deals', url: '/deals' },
          { name: 'Contact', url: '/contact' }
        ]
      },
      search: {
        placeholder: 'Search for shoes, watches, and more...',
        suggestions: [
          'Sports Shoes',
          'Running Shoes',
          'Smart Watches',
          'Luxury Watches',
          'Formal Shoes'
        ]
      },
      userLinks: {
        wishlist: { url: '/wishlist', label: 'Wishlist' },
        cart: { url: '/cart', label: 'Cart' },
        account: { url: '/account', label: 'Account' }
      }
    };

    res.json(headerData);
  } catch (error) {
    console.error('Error fetching header data:', error);
    res.status(500).json({ message: 'Error fetching header data', error: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({ results: [] });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const searchQuery = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'product_info.brand': searchRegex },
        { 'product_info.manufacturer': searchRegex },
        { 'product_info.clothingType': searchRegex },
        { 'product_info.footwearType': searchRegex },
        { 'product_info.accessoryType': searchRegex },
        { 'product_info.babyCareType': searchRegex },
        { 'product_info.toyType': searchRegex },
        { 'product_info.shoeMaterial': searchRegex },
        { 'product_info.material': searchRegex },
        { 'product_info.fabric': searchRegex },
        { 'product_info.shoeType': searchRegex },
        { 'product_info.watchBrand': searchRegex },
        { 'product_info.watchType': searchRegex }
      ]
    };

    // Search across all collections in parallel
    const [products, kidsClothing, kidsAccessories, footwear, babyCare, toys] = await Promise.all([
      Product.find(searchQuery).limit(20).select('title images price mrp discountPercent _id').lean(),
      KidsClothing.find(searchQuery).limit(20).select('title images price mrp discountPercent _id').lean(),
      KidsAccessories.find(searchQuery).limit(20).select('title images price mrp discountPercent _id').lean(),
      Footwear.find(searchQuery).limit(20).select('title images price mrp discountPercent _id').lean(),
      BabyCare.find(searchQuery).limit(20).select('title images price mrp discountPercent _id').lean(),
      Toys.find(searchQuery).limit(20).select('title images price mrp discountPercent _id').lean()
    ]);

    // Combine all results
    const allResults = [
      ...products,
      ...kidsClothing,
      ...kidsAccessories,
      ...footwear,
      ...babyCare,
      ...toys
    ];

    // Remove duplicates based on _id
    const uniqueResults = allResults.filter((product, index, self) =>
      index === self.findIndex((p) => p._id.toString() === product._id.toString())
    );

    // Limit to 20 results
    const limitedResults = uniqueResults.slice(0, 20);

    console.log(`Search for "${query}": Found ${limitedResults.length} products`);
    res.json({ results: limitedResults });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
};
