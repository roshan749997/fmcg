import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import { Product } from '../models/product.js';

const getUserId = (req) => {
  // `authMiddleware.js` sets `req.user` (Mongoose doc) and `req.userId` (string).
  // Some other middleware versions might only set `req.userId`.
  return req.user?._id || req.userId || null;
};

/**
 * POST /api/wishlist/add
 * Body: { productId }
 *
 * Adds product to user's wishlist (no duplicates).
 */
export const addToWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { productId } = req.body || {};
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }

    // Ensure product exists (prevents populating null and gives nicer UX)
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ message: 'Product not found' });

    // $addToSet avoids duplicates at DB-level
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    ).populate('products');

    return res.json({
      products: wishlist?.products || [],
      count: wishlist?.products?.length || 0,
    });
  } catch (err) {
    console.error('[addToWishlist] Error:', err);
    return res.status(500).json({ message: 'Failed to add to wishlist', error: err.message });
  }
};

/**
 * DELETE /api/wishlist/remove/:productId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { productId } = req.params || {};
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate('products');

    return res.json({
      products: wishlist?.products || [],
      count: wishlist?.products?.length || 0,
    });
  } catch (err) {
    console.error('[removeFromWishlist] Error:', err);
    return res.status(500).json({ message: 'Failed to remove from wishlist', error: err.message });
  }
};

/**
 * GET /api/wishlist
 * Returns populated product docs for the logged-in user.
 */
export const getWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    return res.json({
      products: wishlist?.products || [],
      count: wishlist?.products?.length || 0,
    });
  } catch (err) {
    console.error('[getWishlist] Error:', err);
    return res.status(500).json({ message: 'Failed to fetch wishlist', error: err.message });
  }
};

