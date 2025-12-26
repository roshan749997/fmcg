import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number },
    size: { type: String }, // For shoes and other size-based products
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
    items: [CartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);

export default Cart;
