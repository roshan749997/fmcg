import { Product } from '../models/product.js';
import { KidsClothing } from '../models/KidsClothing.js';
import { Footwear } from '../models/Footwear.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import { BabyCare } from '../models/BabyCare.js';
import { Toys } from '../models/Toys.js';
import Order from '../models/Order.js';
import { Address } from '../models/Address.js';
import User from '../models/User.js';

// Helper function to find product in any collection
async function findProductInAllCollections(productId) {
  if (!productId) {
    return null;
  }
  
  // Convert to string if it's an ObjectId
  const idString = productId.toString ? productId.toString() : productId;
  
  const collections = [
    { model: Product, name: 'Product' },
    { model: KidsClothing, name: 'KidsClothing' },
    { model: Footwear, name: 'Footwear' },
    { model: KidsAccessories, name: 'KidsAccessories' },
    { model: BabyCare, name: 'BabyCare' },
    { model: Toys, name: 'Toys' },
  ];
  
  for (const { model, name } of collections) {
    try {
      const product = await model.findById(idString).lean();
      if (product) {
        return product;
      }
    } catch (err) {
      console.error(`[findProductInAllCollections] Error checking ${name}:`, err.message);
    }
  }
  
  return null;
}

// Helper function to populate order items with products from all collections
async function populateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }
  
  return Promise.all(
    items.map(async (item) => {
      try {
        // Handle both ObjectId and string product IDs
        const productId = item.product?.toString ? item.product.toString() : item.product;
        
        if (!productId) {
          console.warn(`[populateOrderItems] Item missing product ID:`, item);
          return {
            ...item,
            product: { _id: null, title: 'Product not found' },
          };
        }
        
        const product = await findProductInAllCollections(productId);
        
        if (!product) {
          console.warn(`[populateOrderItems] Product not found for ID: ${productId}`);
        }
        
        // item is already a plain object from .lean(), so just spread it
        return {
          ...item,
          product: product || { _id: productId, title: 'Product not found' },
        };
      } catch (err) {
        console.error(`[populateOrderItems] Error processing item:`, err);
        return {
          ...item,
          product: { _id: item.product, title: 'Error loading product' },
        };
      }
    })
  );
}

export async function createProduct(req, res) {
  try {
    const {
      title,
      mrp,
      discountPercent = 0,
      description = '',
      category,
      product_info = {},
      images = {},
      categoryId,
    } = req.body || {};

    if (!title || typeof mrp === 'undefined' || !category) {
      return res.status(400).json({ message: 'title, mrp and category are required' });
    }

    const payload = {
      title,
      mrp: Number(mrp),
      discountPercent: Number(discountPercent) || 0,
      description,
      category,
      product_info: {
        brand: product_info.brand || '',
        manufacturer: product_info.manufacturer || '',
        
        /* ---- Kids Clothing ---- */
        clothingType: product_info.clothingType || '',
        gender: product_info.gender || '',
        ageGroup: product_info.ageGroup || '',
        availableSizes: Array.isArray(product_info.availableSizes) ? product_info.availableSizes : 
                       (product_info.availableSizes ? [product_info.availableSizes] : []),
        fabric: product_info.fabric || '',
        color: product_info.color || '',
        
        /* ---- Footwear ---- */
        footwearType: product_info.footwearType || '',
        shoeMaterial: product_info.shoeMaterial || '',
        soleMaterial: product_info.soleMaterial || '',
        
        /* ---- Kids Accessories ---- */
        accessoryType: product_info.accessoryType || '',
        material: product_info.material || '',
        
        /* ---- Baby Care ---- */
        babyCareType: product_info.babyCareType || '',
        ageRange: product_info.ageRange || '',
        safetyStandard: product_info.safetyStandard || '',
        quantity: product_info.quantity || '',
        
        /* ---- Toys ---- */
        toyType: product_info.toyType || '',
        batteryRequired: product_info.batteryRequired || false,
        batteryIncluded: product_info.batteryIncluded || false,
        
        /* ---- Universal ---- */
        includedComponents: product_info.includedComponents || '',
        
        // Legacy fields for backward compatibility
        SareeLength: product_info.SareeLength || '',
        SareeMaterial: product_info.SareeMaterial || product_info.fabric || product_info.material || '',
        SareeColor: product_info.SareeColor || product_info.color || '',
        IncludedComponents: product_info.IncludedComponents || product_info.includedComponents || '',
        shoeSize: product_info.shoeSize || product_info.availableSizes?.[0] || '',
        shoeColor: product_info.shoeColor || product_info.color || '',
        shoeType: product_info.shoeType || product_info.footwearType || '',
        watchBrand: product_info.watchBrand || '',
        movementType: product_info.movementType || '',
        caseMaterial: product_info.caseMaterial || '',
        bandMaterial: product_info.bandMaterial || '',
        waterResistance: product_info.waterResistance || '',
        watchType: product_info.watchType || '',
      },
      images: {
        image1: images.image1,
        image2: images.image2,
        image3: images.image3,
      },
    };

    if (categoryId) payload.categoryId = categoryId;

    // Determine which collection to use based on category
    const categoryLower = (category || '').toLowerCase().replace(/\s+/g, '-');
    let product;
    
    if (categoryLower.includes('kids-clothing') || categoryLower.includes('clothing')) {
      product = await KidsClothing.create(payload);
    } else if (categoryLower.includes('footwear') || categoryLower.includes('shoe')) {
      product = await Footwear.create(payload);
    } else if (categoryLower.includes('kids-accessories') || categoryLower.includes('accessories') || categoryLower.includes('watch') || categoryLower.includes('sunglass')) {
      product = await KidsAccessories.create(payload);
    } else if (categoryLower.includes('baby-care') || categoryLower.includes('babycare') || categoryLower.includes('diaper') || categoryLower.includes('lotion')) {
      product = await BabyCare.create(payload);
    } else if (categoryLower.includes('toy')) {
      product = await Toys.create(payload);
    } else {
      // Default to Product collection for unknown categories
      product = await Product.create(payload);
    }
    
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    let { status, orderStatus } = req.body || {};
    const newStatus = (status || orderStatus || '').toString().toLowerCase();

    const allowed = new Set(['created','confirmed','on_the_way','delivered','failed','paid']);
    if (!allowed.has(newStatus)) {
      return res.status(400).json({ message: 'Invalid status', allowed: Array.from(allowed) });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
}

export async function adminListProducts(req, res) {
  try {
    // Fetch products from all category collections
    const [products, kidsClothing, footwear, kidsAccessories, babyCare, toys] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).lean(),
      KidsClothing.find({}).sort({ createdAt: -1 }).lean(),
      Footwear.find({}).sort({ createdAt: -1 }).lean(),
      KidsAccessories.find({}).sort({ createdAt: -1 }).lean(),
      BabyCare.find({}).sort({ createdAt: -1 }).lean(),
      Toys.find({}).sort({ createdAt: -1 }).lean(),
    ]);
    
    // Combine all products
    const allProducts = [
      ...products,
      ...kidsClothing,
      ...footwear,
      ...kidsAccessories,
      ...babyCare,
      ...toys,
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Sort by newest first
    });
    
    return res.json(allProducts);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list products', error: err.message });
  }
}

export async function deleteProductById(req, res) {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
}

export async function adminListOrders(req, res) {
  try {
    console.log('[adminListOrders] Fetching all orders...');
    
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[adminListOrders] Found ${orders.length} orders`);

    // Get unique user IDs
    const userIds = Array.from(new Set(orders.map(o => String(o.user)).filter(Boolean)));
    
    // Fetch users and addresses
    const [users, addresses] = await Promise.all([
      userIds.length > 0 ? User.find({ _id: { $in: userIds } }).select('name email').lean() : [],
      userIds.length > 0 ? Address.find({ userId: { $in: userIds } }).lean() : [],
    ]);

    // Create maps for quick lookup
    const userMap = Object.fromEntries(users.map(u => [String(u._id), u]));
    const addrMap = Object.fromEntries(addresses.map(a => [String(a.userId), a]));

    // Populate orders with user data, addresses, and products
    const enriched = await Promise.all(
      orders.map(async (order) => {
        try {
          // Populate user
          const user = order.user ? userMap[String(order.user)] : null;
          
          // Populate order items with products
          const populatedItems = await populateOrderItems(order.items || []);
          
          // Get address (prefer shippingAddress, fallback to user's address)
          const address = order.shippingAddress || (order.user ? (addrMap[String(order.user)] || null) : null);
          
          return {
            ...order,
            user: user || { _id: order.user, name: 'Unknown', email: '' },
            items: populatedItems,
            address: address,
          };
        } catch (err) {
          console.error(`[adminListOrders] Error processing order ${order._id}:`, err);
          return {
            ...order,
            user: order.user ? userMap[String(order.user)] : { _id: order.user, name: 'Unknown', email: '' },
            items: order.items || [],
            address: order.shippingAddress || null,
          };
        }
      })
    );

    console.log(`[adminListOrders] Successfully processed ${enriched.length} orders`);
    return res.json(enriched);
  } catch (err) {
    console.error('[adminListOrders] Error:', err);
    return res.status(500).json({ message: 'Failed to list orders', error: err.message });
  }
}

export async function adminStats(req, res) {
  try {
    const [revenueAgg] = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalRevenue = revenueAgg?.total || 0;
    const totalOrders = revenueAgg?.count || 0;
    
    // Count products from all collections
    const [productCount, kidsClothingCount, footwearCount, kidsAccessoriesCount, babyCareCount, toysCount] = await Promise.all([
      Product.countDocuments(),
      KidsClothing.countDocuments(),
      Footwear.countDocuments(),
      KidsAccessories.countDocuments(),
      BabyCare.countDocuments(),
      Toys.countDocuments(),
    ]);
    
    const totalProducts = productCount + kidsClothingCount + footwearCount + kidsAccessoriesCount + babyCareCount + toysCount;
    
    return res.json({ totalRevenue, totalOrders, totalProducts });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load stats', error: err.message });
  }
}

export async function adminListAddresses(req, res) {
  try {
    const addrs = await Address.find({}).sort({ createdAt: -1 }).populate('userId', 'name email').lean();
    return res.json(addrs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list addresses', error: err.message });
  }
}

export async function adminUpdateAddress(req, res) {
  try {
    const { id } = req.params;
    const {
      fullName,
      mobileNumber,
      pincode,
      locality,
      address,
      addressLine1,
      addressLine2,
      city,
      state,
      landmark,
      alternatePhone,
      addressType,
    } = req.body || {};

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (mobileNumber !== undefined) updates.mobileNumber = mobileNumber;
    if (pincode !== undefined) updates.pincode = pincode;
    if (locality !== undefined) updates.locality = locality;
    if (address !== undefined) updates.address = address;
    if (addressLine1 !== undefined) updates.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updates.addressLine2 = addressLine2;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (landmark !== undefined) updates.landmark = landmark;
    if (alternatePhone !== undefined) updates.alternatePhone = alternatePhone;
    if (addressType !== undefined) updates.addressType = addressType;

    const doc = await Address.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Address not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update address', error: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { mrp, discountPercent } = req.body;

    if (typeof mrp === 'undefined' && typeof discountPercent === 'undefined') {
      return res.status(400).json({ message: 'At least one field (mrp or discountPercent) is required' });
    }

    const updates = {};
    if (typeof mrp !== 'undefined') {
      updates.mrp = Number(mrp);
    }
    if (typeof discountPercent !== 'undefined') {
      updates.discountPercent = Number(discountPercent) || 0;
    }

    // Try to update in all collections
    const collections = [
      { model: Product, name: 'Product' },
      { model: KidsClothing, name: 'KidsClothing' },
      { model: Footwear, name: 'Footwear' },
      { model: KidsAccessories, name: 'KidsAccessories' },
      { model: BabyCare, name: 'BabyCare' },
      { model: Toys, name: 'Toys' },
    ];
    
    let updatedProduct = null;
    for (const { model } of collections) {
      try {
        const result = await model.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true, runValidators: true }
        );
        if (result) {
          updatedProduct = result;
          break;
        }
      } catch (err) {
        // Continue to next collection
        continue;
      }
    }

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(updatedProduct);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
}
