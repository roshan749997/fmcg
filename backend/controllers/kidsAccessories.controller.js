import { KidsAccessories } from '../models/KidsAccessories.js';
import { Product } from '../models/product.js';

// Helper function to normalize subcategory names
const normalizeSubcategory = (subcategory) => {
  if (!subcategory) return '';
  return subcategory.replace(/-/g, ' ').trim().toLowerCase();
};

// Helper function to process image URLs
const processImages = (productObj) => {
  const baseUrl = process.env.BASE_URL || 
                 process.env.BACKEND_URL || 
                 (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
  
  const ensureAbsoluteUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url;
    }
    if (url.includes('cloudinary.com') || url.includes('amazonaws.com') || url.includes('cdn')) {
      if (!url.startsWith('http')) {
        return `https://${url}`;
      }
      return url;
    }
    if (baseUrl) {
      return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    }
    return url;
  };
  
  if (productObj.images) {
    if (Array.isArray(productObj.images)) {
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
};

// Get all kids accessories products or filter by subcategory
export const getKidsAccessoriesProducts = async (req, res) => {
  try {
    const rawSubcategory = (req.query.subcategory || req.query.category || '').toString();
    const subcategory = normalizeSubcategory(rawSubcategory);
    
    // Base query: Match kids-accessories category OR watches/accessories/sunglasses (for backward compatibility)
    const baseCategoryQuery = {
      $or: [
        { category: 'kids-accessories' },
        { category: { $regex: /watch/i } }, // Match "Watches" category
        { category: { $regex: /sunglass/i } }, // Match "Sunglasses" category
        { category: { $regex: /accessories/i } }
      ]
    };
    
    let query = baseCategoryQuery;
    
    if (subcategory) {
      // If subcategory is provided, match it in subcategory field OR category field
      query = {
        $and: [
          baseCategoryQuery,
          {
            $or: [
              { subcategory: { $regex: new RegExp(subcategory, 'i') } },
              { category: { $regex: new RegExp(subcategory, 'i') } },
              // Also match if subcategory is "watches" and category is "Watches"
              ...(subcategory.includes('watch') ? [{ category: { $regex: /watch/i } }] : []),
              // Also match if subcategory is "sunglasses" and category is "Sunglasses"
              ...(subcategory.includes('sunglass') ? [{ category: { $regex: /sunglass/i } }] : [])
            ]
          }
        ]
      };
    }
    
    // Additional filters
    if (req.query.accessoryType) {
      if (query.$and) {
        query.$and.push({ 'product_info.accessoryType': { $regex: new RegExp(req.query.accessoryType, 'i') } });
      } else {
        query['product_info.accessoryType'] = { $regex: new RegExp(req.query.accessoryType, 'i') };
      }
    }
    if (req.query.material) {
      if (query.$and) {
        query.$and.push({ 'product_info.material': { $regex: new RegExp(req.query.material, 'i') } });
      } else {
        query['product_info.material'] = { $regex: new RegExp(req.query.material, 'i') };
      }
    }
    
    console.log('KidsAccessories query:', JSON.stringify(query, null, 2));
    let products = await KidsAccessories.find(query).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products in KidsAccessories collection`);
    
    // Also check legacy Product collection for backward compatibility
    // Especially for products that might have category: "Sunglasses" or "Watches"
    const legacyBaseQuery = {
      $or: [
        { category: { $regex: /sunglass/i } },
        { category: { $regex: /watch/i } },
        { category: { $regex: /accessories/i } },
        { 'product_info.accessoryType': { $exists: true } }
      ]
    };
    
    let legacyQuery = legacyBaseQuery;
    
    if (subcategory) {
      legacyQuery = {
        $and: [
          legacyBaseQuery,
          {
            $or: [
              { category: { $regex: new RegExp(subcategory, 'i') } },
              { subcategory: { $regex: new RegExp(subcategory, 'i') } },
              { 'product_info.accessoryType': { $regex: new RegExp(subcategory, 'i') } }
            ]
          }
        ]
      };
    }
    
    const legacyProducts = await Product.find(legacyQuery).sort({ createdAt: -1 });
    console.log(`Found ${legacyProducts.length} products in legacy Product collection`);
    
    // Merge products, avoiding duplicates
    const existingIds = new Set(products.map(p => String(p._id)));
    const newLegacyProducts = legacyProducts.filter(p => !existingIds.has(String(p._id)));
    products = [...products, ...newLegacyProducts];
    console.log(`Total products after merge: ${products.length}`);
    
    // Process images
    const processedProducts = products.map(product => {
      const productObj = product.toObject();
      return processImages(productObj);
    });
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Error fetching kids accessories products:', error);
    res.status(500).json({ 
      message: 'Error fetching kids accessories products', 
      error: error.message 
    });
  }
};

// Get single product by ID
export const getKidsAccessoriesProductById = async (req, res) => {
  try {
    const product = await KidsAccessories.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productObj = product.toObject();
    const processedProduct = processImages(productObj);
    
    res.json(processedProduct);
  } catch (error) {
    console.error('Error fetching kids accessories product:', error);
    res.status(500).json({ 
      message: 'Error fetching kids accessories product', 
      error: error.message 
    });
  }
};
