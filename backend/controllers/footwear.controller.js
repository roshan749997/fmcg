import { Footwear } from '../models/Footwear.js';
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

// Get all footwear products or filter by subcategory
export const getFootwearProducts = async (req, res) => {
  try {
    // Only use subcategory parameter, not category (category is used to identify the endpoint)
    const rawSubcategory = (req.query.subcategory || '').toString();
    const subcategory = normalizeSubcategory(rawSubcategory);
    
    // Base query: Match footwear category OR subcategory names in category field
    const baseCategoryQuery = {
      $or: [
        { category: 'footwear' },
        { category: { $regex: /footwear|shoe|sandal|slipper|boot/i } }
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
    if (req.query.footwearType) {
      if (query.$and) {
        query.$and.push({ 'product_info.footwearType': { $regex: new RegExp(req.query.footwearType, 'i') } });
      } else {
        query['product_info.footwearType'] = { $regex: new RegExp(req.query.footwearType, 'i') };
      }
    }
    if (req.query.shoeMaterial) {
      if (query.$and) {
        query.$and.push({ 'product_info.shoeMaterial': { $regex: new RegExp(req.query.shoeMaterial, 'i') } });
      } else {
        query['product_info.shoeMaterial'] = { $regex: new RegExp(req.query.shoeMaterial, 'i') };
      }
    }
    
    console.log('Footwear query:', JSON.stringify(query, null, 2));
    
    // Fetch from Footwear collection
    const footwearProducts = await Footwear.find(query).sort({ createdAt: -1 });
    console.log(`Found ${footwearProducts.length} products in Footwear collection`);
    
    // Also fetch from legacy Product collection for backward compatibility
    let legacyProducts = [];
    const legacyQuery = {
      $and: [
        {
          $or: [
            { category: { $regex: /footwear|shoe|sandal|slipper|boot/i } }
          ]
        }
      ]
    };
    if (subcategory) {
      legacyQuery.$and.push({
        $or: [
          { 'product_info.footwearType': { $regex: new RegExp(subcategory, 'i') } },
          { subcategory: { $regex: new RegExp(subcategory, 'i') } },
          { category: { $regex: new RegExp(subcategory, 'i') } }
        ]
      });
    }
    legacyProducts = await Product.find(legacyQuery).sort({ createdAt: -1 });
    console.log(`Found ${legacyProducts.length} products in legacy Product collection`);
    
    // Merge and remove duplicates
    let allProducts = [...footwearProducts];
    const existingIds = new Set(footwearProducts.map(p => String(p._id)));
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
    console.error('Error fetching footwear products:', error);
    res.status(500).json({ 
      message: 'Error fetching footwear products', 
      error: error.message 
    });
  }
};

// Get single product by ID
export const getFootwearProductById = async (req, res) => {
  try {
    const product = await Footwear.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productObj = product.toObject();
    const processedProduct = processImages(productObj);
    
    res.json(processedProduct);
  } catch (error) {
    console.error('Error fetching footwear product:', error);
    res.status(500).json({ 
      message: 'Error fetching footwear product', 
      error: error.message 
    });
  }
};
