import Wishlist from '../models/Wishlist.js';
import { Product } from '../models/product.js';
import mongoose from 'mongoose';

// GET /api/wishlist -> Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'items.product',
      match: { _id: { $exists: true } } // Only populate if product exists
    });
    
    // Filter out items where product was deleted (null after populate)
    if (wishlist && wishlist.items) {
      wishlist.items = wishlist.items.filter(item => item.product !== null);
      await wishlist.save(); // Save to remove deleted products
    }
    
    return res.json(wishlist || { user: userId, items: [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

// POST /api/wishlist/add -> Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { productId } = req.body || {};
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    
    // Validate productId format
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid productId format' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    // Check if product already exists in wishlist
    const exists = wishlist.items.some(
      item => item.product.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    const populated = await wishlist.populate('items.product');
    return res.json(populated);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
};

// DELETE /api/wishlist/remove/:productId -> Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    
    // Validate productId format
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid productId format' });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.json({ user: userId, items: [] });
    }

    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );
    await wishlist.save();

    const populated = await wishlist.populate('items.product');
    return res.json(populated);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
};

// GET /api/wishlist/count -> Get wishlist item count
export const getWishlistCount = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.json({ count: 0 });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    const count = wishlist ? wishlist.items.length : 0;
    return res.json({ count });
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return res.json({ count: 0 });
  }
};

