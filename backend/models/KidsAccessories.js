import mongoose from "mongoose";

const kidsAccessoriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    category: { type: String, default: 'kids-accessories', index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },
    subcategory: { type: String, index: true }, // e.g., "watches", "sunglasses"

    product_info: {
      brand: { type: String },
      manufacturer: { type: String },
      
      // Kids Accessories specific fields
      accessoryType: { type: String, required: true }, // Cap, Bag, Sunglasses, Watch, Backpack, Wallet, Belt, Hair Accessories
      material: { type: String },
      color: { type: String, index: true },
      availableSizes: { type: [String], default: [] },
      
      // Universal
      includedComponents: { type: String },
    },

    images: {
      image1: { type: String, required: true },
      image2: { type: String },
      image3: { type: String },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field: Automatically calculate final price after discount
kidsAccessoriesSchema.virtual("price").get(function () {
  const discount = (this.mrp * this.discountPercent) / 100;
  return Math.round(this.mrp - discount);
});

// Indexes for faster queries
kidsAccessoriesSchema.index({ category: 1, subcategory: 1 });
kidsAccessoriesSchema.index({ 'product_info.accessoryType': 1 });
kidsAccessoriesSchema.index({ 'product_info.material': 1 });
kidsAccessoriesSchema.index({ createdAt: -1 });

export const KidsAccessories = mongoose.model("KidsAccessories", kidsAccessoriesSchema);

