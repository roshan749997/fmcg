import { Router } from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Cart from '../models/Cart.js';
import { Product } from '../models/product.js';
import { KidsClothing } from '../models/KidsClothing.js';
import { Footwear } from '../models/Footwear.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import { BabyCare } from '../models/BabyCare.js';
import { Toys } from '../models/Toys.js';

const router = Router();

// Helper function to find product in any collection
async function findProductInAllCollections(productId) {
  const collections = [
    { model: Product, name: 'Product' },
    { model: KidsClothing, name: 'KidsClothing' },
    { model: Footwear, name: 'Footwear' },
    { model: KidsAccessories, name: 'KidsAccessories' },
    { model: BabyCare, name: 'BabyCare' },
    { model: Toys, name: 'Toys' },
  ];

  for (const { model } of collections) {
    try {
      const product = await model.findById(productId);
      if (product) {
        return product;
      }
    } catch (err) {
      // Continue to next collection
    }
  }
  return null;
}

// Helper function to populate cart items
async function populateCartItems(items) {
  return Promise.all(
    items.map(async (item) => {
      const product = await findProductInAllCollections(item.product);
      // Convert Mongoose document to plain object to ensure proper serialization
      const productObj = product ? (product.toObject ? product.toObject() : product) : item.product;
      return {
        ...item.toObject(),
        product: productObj, // Keep original ID if product not found
      };
    })
  );
}

// GET /api/cart -> current user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.json({ user: req.userId, items: [] });
    }

    // Manually populate products from all collections
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await findProductInAllCollections(item.product);
        // Convert Mongoose document to plain object to ensure proper serialization
        const productObj = product ? (product.toObject ? product.toObject() : product) : item.product;
        return {
          ...item.toObject(),
          product: productObj, // Keep original ID if product not found
        };
      })
    );

    res.json({
      ...cart.toObject(),
      items: populatedItems,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

// POST /api/cart/add -> { productId, quantity?, size? }
router.post('/add', auth, async (req, res) => {
  const { productId, quantity = 1, size } = req.body || {};
  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }
  const qty = Number(quantity) || 1;
  if (qty < 1) return res.status(400).json({ message: 'Quantity must be >= 1' });

  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) cart = new Cart({ user: req.userId, items: [] });

  // For size-based products (like shoes), match by both productId AND size
  // For non-size products, match only by productId
  const idx = cart.items.findIndex(i => {
    const productMatch = i.product.toString() === productId;
    if (size) {
      return productMatch && i.size === size;
    }
    return productMatch && !i.size; // Match items without size
  });

  if (idx > -1) {
    cart.items[idx].quantity += qty;
  } else {
    cart.items.push({ product: productId, quantity: qty, size: size || undefined });
  }

  await cart.save();
  
  // Manually populate products from all collections
  const populatedItems = await populateCartItems(cart.items);
  
  res.json({
    ...cart.toObject(),
    items: populatedItems,
  });
});

// DELETE /api/cart/remove/:id -> remove by productId, optionally with size query param
router.delete('/remove/:id', auth, async (req, res) => {
  const { id: productId } = req.params;
  const { size } = req.query; // Optional size parameter
  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.json({ user: req.userId, items: [] });

  // If size is provided, remove only items with matching productId AND size
  // Otherwise, remove all items with matching productId (backward compatibility)
  if (size) {
    cart.items = cart.items.filter(i => 
      !(i.product.toString() === productId && i.size === size)
    );
  } else {
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
  }
  
  await cart.save();
  
  // Manually populate products from all collections
  const populatedItems = await populateCartItems(cart.items);
  
  res.json({
    ...cart.toObject(),
    items: populatedItems,
  });
});

// PUT /api/cart/update -> update quantity by productId and optionally size
router.put('/update', auth, async (req, res) => {
  const { productId, quantity, size } = req.body || {};
  if (!productId || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }
  const qty = Number(quantity);
  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({ message: 'Quantity must be >= 1' });
  }

  const cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  // Find item by productId and optionally size
  const idx = cart.items.findIndex(i => {
    const productMatch = i.product.toString() === productId;
    if (size !== undefined && size !== null) {
      return productMatch && i.size === size;
    }
    return productMatch && !i.size;
  });

  if (idx === -1) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  cart.items[idx].quantity = qty;
  await cart.save();
  
  // Manually populate products from all collections
  const populatedItems = await populateCartItems(cart.items);
  
  res.json({
    ...cart.toObject(),
    items: populatedItems,
  });
});

export default router;
