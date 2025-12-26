import mongoose from 'mongoose';

const WishlistItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { _id: false }
);

const WishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
    items: [WishlistItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WishlistSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
export default Wishlist;









