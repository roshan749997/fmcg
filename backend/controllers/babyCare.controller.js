import { BabyCare } from '../models/BabyCare.js';
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

// Get all baby care products or filter by subcategory
export const getBabyCareProducts = async (req, res) => {
  try {
    // Only use subcategory parameter, not category (category is used to identify the endpoint)
    const rawSubcategory = (req.query.subcategory || '').toString();
    const subcategory = normalizeSubcategory(rawSubcategory);
    
    // Base query: Match baby-care category OR subcategory names in category field
    // This handles products where category might be "Diapers", "Wipes", etc. instead of "baby-care"
    const baseCategoryQuery = {
      $or: [
        { category: 'baby-care' },
        { category: { $regex: /baby-care|babycare/i } },
        // Match common baby care subcategories in category field
        { category: { $regex: /diaper|wipe|baby gear|baby proofing|safety/i } }
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
              { category: { $regex: new RegExp(subcategory, 'i') } }
            ]
          }
        ]
      };
    }
    
    // Additional filters
    if (req.query.babyCareType) {
      if (query.$and) {
        query.$and.push({ 'product_info.babyCareType': { $regex: new RegExp(req.query.babyCareType, 'i') } });
      } else {
        query['product_info.babyCareType'] = { $regex: new RegExp(req.query.babyCareType, 'i') };
      }
    }
    if (req.query.ageRange) {
      if (query.$and) {
        query.$and.push({ 'product_info.ageRange': { $regex: new RegExp(req.query.ageRange, 'i') } });
      } else {
        query['product_info.ageRange'] = { $regex: new RegExp(req.query.ageRange, 'i') };
      }
    }
    if (req.query.safetyStandard) {
      if (query.$and) {
        query.$and.push({ 'product_info.safetyStandard': { $regex: new RegExp(req.query.safetyStandard, 'i') } });
      } else {
        query['product_info.safetyStandard'] = { $regex: new RegExp(req.query.safetyStandard, 'i') };
      }
    }
    
    console.log('BabyCare query:', JSON.stringify(query, null, 2));
    
    // Fetch from BabyCare collection
    const babyCareProducts = await BabyCare.find(query).sort({ createdAt: -1 });
    console.log(`Found ${babyCareProducts.length} products in BabyCare collection`);
    
    // Also fetch from legacy Product collection for backward compatibility
    let legacyProducts = [];
    const legacyQuery = {
      $and: [
        {
          $or: [
            { category: { $regex: /baby-care|babycare/i } },
            { category: { $regex: /diaper|wipe|baby gear|baby proofing|safety/i } }
          ]
        }
      ]
    };
    if (subcategory) {
      legacyQuery.$and.push({
        $or: [
          { 'product_info.babyCareType': { $regex: new RegExp(subcategory, 'i') } },
          { subcategory: { $regex: new RegExp(subcategory, 'i') } },
          { category: { $regex: new RegExp(subcategory, 'i') } }
        ]
      });
    }
    legacyProducts = await Product.find(legacyQuery).sort({ createdAt: -1 });
    console.log(`Found ${legacyProducts.length} products in legacy Product collection`);
    
    // Merge and remove duplicates
    let allProducts = [...babyCareProducts];
    const existingIds = new Set(babyCareProducts.map(p => String(p._id)));
    legacyProducts.forEach(p => {
      if (!existingIds.has(String(p._id))) {
        allProducts.push(p);
      }
    });
    console.log(`Total products after merge: ${allProducts.length}`);
    
    // Process images
    const processedProducts = allProducts.map(product => {
      const productObj = product.toObject();
      return processImages(productObj);
    });
    
    res.json(processedProducts);
  } catch (error) {
    console.error('Error fetching baby care products:', error);
    res.status(500).json({ 
      message: 'Error fetching baby care products', 
      error: error.message 
    });
  }
};

// Get single product by ID
export const getBabyCareProductById = async (req, res) => {
  try {
    const product = await BabyCare.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productObj = product.toObject();
    const processedProduct = processImages(productObj);
    
    res.json(processedProduct);
  } catch (error) {
    console.error('Error fetching baby care product:', error);
    res.status(500).json({ 
      message: 'Error fetching baby care product', 
      error: error.message 
    });
  }
};
