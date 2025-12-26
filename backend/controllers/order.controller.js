import Order from '../models/Order.js';
import { Product } from '../models/product.js';
import { KidsClothing } from '../models/KidsClothing.js';
import { Footwear } from '../models/Footwear.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import { BabyCare } from '../models/BabyCare.js';
import { Toys } from '../models/Toys.js';

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
      const product = await model.findById(idString);
      if (product) {
        return product;
      }
    } catch (err) {
      // Continue to next collection
      console.warn(`[findProductInAllCollections] Error searching ${name} collection:`, err.message);
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
        // Convert Mongoose document to plain object to ensure proper serialization
        const productObj = product ? (product.toObject ? product.toObject() : product) : null;
        
        if (!productObj) {
          console.warn(`[populateOrderItems] Product not found for ID: ${productId}`);
        }
        
        // item is already a plain object from .lean(), so just spread it
        return {
          ...item,
          product: productObj || { _id: productId, title: 'Product not found' },
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

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    console.log(`[getMyOrders] Fetching orders for user: ${userId}`);
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[getMyOrders] Found ${orders.length} orders`);

    // Manually populate products from all collections
    const populatedOrders = await Promise.all(
      orders.map(async (order, index) => {
        try {
          console.log(`[getMyOrders] Processing order ${index + 1}/${orders.length}, items: ${order.items?.length || 0}`);
          const populatedItems = await populateOrderItems(order.items || []);
          return {
            ...order,
            items: populatedItems,
          };
        } catch (err) {
          console.error(`[getMyOrders] Error processing order ${order._id}:`, err);
          // Return order with empty items if population fails
          return {
            ...order,
            items: [],
          };
        }
      })
    );

    console.log(`[getMyOrders] Successfully populated ${populatedOrders.length} orders`);
    return res.json(populatedOrders);
  } catch (err) {
    console.error('[getMyOrders] Error fetching orders:', err);
    console.error('[getMyOrders] Error stack:', err.stack);
    return res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: userId }).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Manually populate products from all collections
    const populatedItems = await populateOrderItems(order.items || []);
    const populatedOrder = {
      ...order,
      items: populatedItems,
    };

    return res.json(populatedOrder);
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};
