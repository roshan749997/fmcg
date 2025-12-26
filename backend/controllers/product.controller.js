import { Product } from '../models/product.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import { KidsClothing } from '../models/KidsClothing.js';
import { Footwear } from '../models/Footwear.js';
import { BabyCare } from '../models/BabyCare.js';
import { Toys } from '../models/Toys.js';

const CATEGORY_GROUPS = {
  'Shoes': [
    'Men\'s Shoes',
    'Women\'s Shoes',
    'Sports Shoes',
    'Casual Shoes',
    'Formal Shoes',
    'Sneakers',
    'Boots',
    'Sandals',
    'Running Shoes',
    'Walking Shoes'
  ],
  'Watches': [
    'Men\'s Watches',
    'Women\'s Watches',
    'Smart Watches',
    'Luxury Watches',
    'Sports Watches',
    'Analog Watches',
    'Digital Watches',
    'Fitness Trackers',
    'Chronograph Watches',
    'Classic Watches'
  ]
};

// Parent category to subcategories mapping - used when querying for parent categories
const PARENT_TO_SUBCATEGORIES = {
  "Men's Shoes": [
    'Men Sports Shoes',
    'Men Casual Shoes',
    'Men Formal Shoes',
    'Men Sneakers',
    'Men Boots',
    'Men Running Shoes'
  ],
  "Women's Shoes": [
    'Women Heels',
    'Women Flats',
    'Women Sneakers',
    'Women Sports Shoes',
    'Women Casual Shoes',
    'Women Sandals'
  ],
  "Child Shoes": [
    'Child School Shoes',
    'Child Sports Shoes',
    'Child Casual Shoes',
    'Child Sandals',
    'Child Sneakers'
  ],
  "Girls Shoes": [
    'Girls School Shoes',
    'Girls Sports Shoes',
    'Girls Casual Shoes',
    'Girls Sandals',
    'Girls Sneakers'
  ],
  "Women Watches": [
    'Women Analog Watches',
    'Women Digital Watches',
    'Women Smart Watches',
    'Women Fitness Trackers',
    'Women Classic Watches'
  ],
  "Men Watches": [
    'Men Analog Watches',
    'Men Digital Watches',
    'Men Smart Watches',
    'Men Sports Watches',
    'Men Luxury Watches',
    'Men Chronograph Watches'
  ]
};

// Helper function to normalize category names (handles variations like "Womens Shoes" vs "Women's Shoes")
const normalizeCategoryName = (name) => {
  if (!name) return '';
  // Handle common variations
  const normalized = name.trim();
  const variations = {
    'Womens Shoes': "Women's Shoes",
    'Mens Shoes': "Men's Shoes",
    'Women Watches': 'Women Watches',
    'Girl Watches': 'Women Watches', // Backward compatibility
    'Men Watches': 'Men Watches'
  };
  return variations[normalized] || normalized;
};

export const getProducts = async (req, res) => {
  try {
    // Accept either `subcategory` (preferred) or `category` query param
    const rawCategory = (req.query.subcategory || req.query.category || '').toString();
    // normalize slug-like values (e.g., "soft-silk" -> "soft silk") and trim
    const category = rawCategory.replace(/-/g, ' ').trim();
    let query = {};

    console.log('Received request with query params:', req.query);

    if (category) {
      // Normalize category name to handle variations
      const normalizedCategory = normalizeCategoryName(category);
      
      // Try multiple ways to match the category or subcategory fields
      const re = new RegExp(category, 'i');
      const normalizedRe = normalizedCategory !== category ? new RegExp(normalizedCategory, 'i') : null;
      
      const orConditions = [
        { 'category.name': { $regex: re } },
        { 'category': { $regex: re } },
        { 'category.slug': { $regex: re } },
        { 'subcategory': { $regex: re } },
        { 'tags': { $regex: re } }
      ];
      
      // Special handling for kids-accessories - also match "Watches" category
      if (category.toLowerCase().includes('kids-accessories') || category.toLowerCase().includes('kids accessories') || 
          category.toLowerCase().includes('accessories')) {
        orConditions.push(
          { category: { $regex: /watch/i } },
          { 'product_info.watchType': { $exists: true } },
          { 'product_info.watchBrand': { $exists: true } }
        );
      }

      // Also add normalized category regex if different
      if (normalizedRe) {
        orConditions.push(
          { 'category.name': { $regex: normalizedRe } },
          { 'category': { $regex: normalizedRe } },
          { 'subcategory': { $regex: normalizedRe } }
        );
      }

      // If this is a parent category, also search for all its subcategories
      if (PARENT_TO_SUBCATEGORIES[normalizedCategory]) {
        PARENT_TO_SUBCATEGORIES[normalizedCategory].forEach((sub) => {
          const subRe = new RegExp(sub, 'i');
          orConditions.push({ category: subRe });
          orConditions.push({ 'category.name': subRe });
          orConditions.push({ subcategory: subRe });
        });
        console.log(`Including subcategories for parent category "${normalizedCategory}":`, PARENT_TO_SUBCATEGORIES[normalizedCategory]);
      }

      // Also check if the original (non-normalized) category is a parent
      if (PARENT_TO_SUBCATEGORIES[category]) {
        PARENT_TO_SUBCATEGORIES[category].forEach((sub) => {
          const subRe = new RegExp(sub, 'i');
          orConditions.push({ category: subRe });
          orConditions.push({ 'category.name': subRe });
          orConditions.push({ subcategory: subRe });
        });
      }

      // Also check if it matches any subcategory name directly (e.g., "Women Heels")
      // This allows direct subcategory matching
      Object.keys(PARENT_TO_SUBCATEGORIES).forEach((parent) => {
        if (PARENT_TO_SUBCATEGORIES[parent].some(sub => 
          sub.toLowerCase() === category.toLowerCase() || 
          category.toLowerCase().includes(sub.toLowerCase()) ||
          sub.toLowerCase().includes(category.toLowerCase())
        )) {
          // This is a subcategory, make sure we search for it
          const subRe = new RegExp(category, 'i');
          orConditions.push({ category: subRe });
          orConditions.push({ 'category.name': subRe });
        }
      });

      if (CATEGORY_GROUPS[category]) {
        CATEGORY_GROUPS[category].forEach((sub) => {
          orConditions.push({ category: { $regex: new RegExp(sub, 'i') } });
        });
      }

      query = { $or: orConditions };

      console.log('Search query:', JSON.stringify(query, null, 2));
    }

    // Get all products (for debugging)
    const allProducts = await Product.find({});
    console.log(`Total products in database: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('Sample product:', {
        _id: allProducts[0]._id,
        title: allProducts[0].title,
        category: allProducts[0].category,
        price: allProducts[0].price
      });
      
      // Log all unique categories in the database
      const categories = [...new Set(allProducts.map(p => 
        p.category ? (typeof p.category === 'string' ? p.category : p.category.name) : 'None'
      ))];
      console.log('All categories in database:', categories);
    }

    // Execute the query - also check category-specific collections
    let products = await Product.find(query);
    console.log(`Found ${products.length} matching products from Product collection`);

    // Also fetch from category-specific collections if category matches
    const catLower = category.toLowerCase();
    
    // Kids Accessories - also check for watches
    if (catLower.includes('kids-accessories') || catLower.includes('kids accessories') || 
        catLower.includes('watch') || catLower.includes('accessories')) {
      try {
        let accessoriesQuery = { category: 'kids-accessories' };
        if (category) {
          const re = new RegExp(category, 'i');
          accessoriesQuery.$or = [
            { subcategory: { $regex: re } },
            { 'product_info.accessoryType': { $regex: re } },
            { title: { $regex: re } }
          ];
        }
        const accessoriesProducts = await KidsAccessories.find(accessoriesQuery);
        console.log(`Found ${accessoriesProducts.length} products from KidsAccessories collection`);
        products = [...products, ...accessoriesProducts];
      } catch (err) {
        console.error('Error fetching from KidsAccessories:', err);
      }
    }
    
    // Also fetch watches from old Product collection
    if (catLower.includes('watch') || catLower.includes('kids-accessories') || catLower.includes('kids accessories')) {
      try {
        const watchQuery = {
          $or: [
            { category: { $regex: /watch/i } },
            { 'product_info.watchType': { $exists: true } },
            { 'product_info.watchBrand': { $exists: true } }
          ]
        };
        const watchProducts = await Product.find(watchQuery);
        // Remove duplicates
        const existingIds = new Set(products.map(p => String(p._id)));
        const newWatchProducts = watchProducts.filter(p => !existingIds.has(String(p._id)));
        console.log(`Found ${newWatchProducts.length} additional watch products from Product collection`);
        products = [...products, ...newWatchProducts];
      } catch (err) {
        console.error('Error fetching watches:', err);
      }
    }
    
    console.log(`Total products found: ${products.length}`);

    // Process image URLs to ensure they're absolute
    products = products.map(product => {
      const productObj = product.toObject();
      // Get base URL from environment - use production URL or fallback to localhost for development
      const baseUrl = process.env.BASE_URL || 
                     process.env.BACKEND_URL || 
                     (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
      
      // Helper function to ensure URL is absolute
      const ensureAbsoluteUrl = (url) => {
        if (!url || typeof url !== 'string') return url;
        
        // Already absolute URL (http://, https://, or //)
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
          return url;
        }
        
        // Cloudinary or other CDN URLs (usually already absolute)
        if (url.includes('cloudinary.com') || url.includes('amazonaws.com') || url.includes('cdn')) {
          // If it's missing protocol, add https
          if (!url.startsWith('http')) {
            return `https://${url}`;
          }
          return url;
        }
        
        // Relative URL - prepend baseUrl only if baseUrl is set
        if (baseUrl) {
          return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
        }
        
        // If no baseUrl in production and relative URL, return as-is (assume same domain)
        return url;
      };
      
      // Handle both image structures: array of objects OR object with image1/image2/image3
      if (productObj.images) {
        if (Array.isArray(productObj.images)) {
          // Array structure - convert back to object format for frontend consistency
          const imagesObj = {};
          productObj.images.forEach((img, index) => {
            if (img && img.url) {
              imagesObj[`image${index + 1}`] = ensureAbsoluteUrl(img.url);
            }
          });
          // If array is empty but we have object structure, keep original
          if (Object.keys(imagesObj).length > 0) {
            productObj.images = imagesObj;
          }
        } else if (typeof productObj.images === 'object') {
          // Object structure with image1, image2, image3 - ensure URLs are absolute
          const processedImages = {};
          ['image1', 'image2', 'image3'].forEach(key => {
            if (productObj.images[key]) {
              processedImages[key] = ensureAbsoluteUrl(productObj.images[key]);
            }
          });
          productObj.images = processedImages;
        }
      }
      
      return productObj;
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    // Try Product collection first
    let product = await Product.findById(req.params.id);
    
    // If not found, try category-specific collections
    if (!product) {
      product = await KidsAccessories.findById(req.params.id);
    }
    if (!product) {
      product = await KidsClothing.findById(req.params.id);
    }
    if (!product) {
      product = await Footwear.findById(req.params.id);
    }
    if (!product) {
      product = await BabyCare.findById(req.params.id);
    }
    if (!product) {
      product = await Toys.findById(req.params.id);
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert to plain object to modify
    const productObj = product.toObject();
    
    // Get base URL from environment - use production URL or fallback to localhost for development
    const baseUrl = process.env.BASE_URL || 
                   process.env.BACKEND_URL || 
                   (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    
    // Helper function to ensure URL is absolute
    const ensureAbsoluteUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      
      // Already absolute URL (http://, https://, or //)
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        return url;
      }
      
      // Cloudinary or other CDN URLs (usually already absolute)
      if (url.includes('cloudinary.com') || url.includes('amazonaws.com') || url.includes('cdn')) {
        // If it's missing protocol, add https
        if (!url.startsWith('http')) {
          return `https://${url}`;
        }
        return url;
      }
      
      // Relative URL - prepend baseUrl only if baseUrl is set
      if (baseUrl) {
        return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      }
      
      // If no baseUrl in production and relative URL, return as-is (assume same domain)
      return url;
    };
    
    // Process image URLs to ensure they're absolute and maintain object structure
    if (productObj.images) {
      if (Array.isArray(productObj.images)) {
        // Array structure - convert back to object format for frontend consistency
        const imagesObj = {};
        productObj.images.forEach((img, index) => {
          if (img && img.url) {
            imagesObj[`image${index + 1}`] = ensureAbsoluteUrl(img.url);
          }
        });
        if (Object.keys(imagesObj).length > 0) {
          productObj.images = imagesObj;
        }
      } else if (typeof productObj.images === 'object') {
        // Object structure with image1, image2, image3 - ensure URLs are absolute
        const processedImages = {};
        ['image1', 'image2', 'image3'].forEach(key => {
          if (productObj.images[key]) {
            processedImages[key] = ensureAbsoluteUrl(productObj.images[key]);
          }
        });
        productObj.images = processedImages;
      }
    }
    
    res.json(productObj);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Error fetching product', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
