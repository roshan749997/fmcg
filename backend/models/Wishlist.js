import mongoose from 'mongoose';

/**
 * Wishlist model
 * - One wishlist per user
 * - Stores an array of Product references
 */
const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);

export default Wishlist;

