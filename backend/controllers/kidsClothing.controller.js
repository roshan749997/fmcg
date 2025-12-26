import { KidsClothing } from '../models/KidsClothing.js';
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

// Get all kids clothing products or filter by subcategory
export const getKidsClothingProducts = async (req, res) => {
  try {
    // Only use subcategory parameter, not category (category is used to identify the endpoint)
    const rawSubcategory = (req.query.subcategory || '').toString();
    const subcategory = normalizeSubcategory(rawSubcategory);
    
    // Base query: Match kids-clothing category OR subcategory names in category field
    const baseCategoryQuery = {
      $or: [
        { category: 'kids-clothing' },
        { category: { $regex: /kids-clothing|kids clothing|clothing/i } },
        // Match common kids clothing subcategories
        { category: { $regex: /girls cloth|boys cloth|winterwear|girl|boy/i } }
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
    if (req.query.gender) {
      if (query.$and) {
        query.$and.push({ 'product_info.gender': { $regex: new RegExp(req.query.gender, 'i') } });
      } else {
        query['product_info.gender'] = { $regex: new RegExp(req.query.gender, 'i') };
      }
    }
    if (req.query.ageGroup) {
      if (query.$and) {
        query.$and.push({ 'product_info.ageGroup': { $regex: new RegExp(req.query.ageGroup, 'i') } });
      } else {
        query['product_info.ageGroup'] = { $regex: new RegExp(req.query.ageGroup, 'i') };
      }
    }
    if (req.query.clothingType) {
      if (query.$and) {
        query.$and.push({ 'product_info.clothingType': { $regex: new RegExp(req.query.clothingType, 'i') } });
      } else {
        query['product_info.clothingType'] = { $regex: new RegExp(req.query.clothingType, 'i') };
      }
    }
    
    console.log('KidsClothing query:', JSON.stringify(query, null, 2));
    
    // Fetch from KidsClothing collection
    const kidsClothingProducts = await KidsClothing.find(query).sort({ createdAt: -1 });
    console.log(`Found ${kidsClothingProducts.length} products in KidsClothing collection`);
    
    // Also fetch from legacy Product collection for backward compatibility
    let legacyProducts = [];
    const legacyQuery = {
      $and: [
        {
          $or: [
            { category: { $regex: /kids-clothing|kids clothing|clothing/i } },
            { category: { $regex: /girls cloth|boys cloth|winterwear|girl|boy/i } }
          ]
        }
      ]
    };
    if (subcategory) {
      legacyQuery.$and.push({
        $or: [
          { 'product_info.clothingType': { $regex: new RegExp(subcategory, 'i') } },
          { subcategory: { $regex: new RegExp(subcategory, 'i') } },
          { category: { $regex: new RegExp(subcategory, 'i') } }
        ]
      });
    }
    legacyProducts = await Product.find(legacyQuery).sort({ createdAt: -1 });
    console.log(`Found ${legacyProducts.length} products in legacy Product collection`);
    
    // Merge and remove duplicates
    let allProducts = [...kidsClothingProducts];
    const existingIds = new Set(kidsClothingProducts.map(p => String(p._id)));
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
    console.error('Error fetching kids clothing products:', error);
    res.status(500).json({ 
      message: 'Error fetching kids clothing products', 
      error: error.message 
    });
  }
};

// Get single product by ID
export const getKidsClothingProductById = async (req, res) => {
  try {
    const product = await KidsClothing.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productObj = product.toObject();
    const processedProduct = processImages(productObj);
    
    res.json(processedProduct);
  } catch (error) {
    console.error('Error fetching kids clothing product:', error);
    res.status(500).json({ 
      message: 'Error fetching kids clothing product', 
      error: error.message 
    });
  }
};
