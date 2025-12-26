import mongoose from "mongoose";

const kidsClothingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    category: { type: String, default: 'kids-clothing', index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },
    subcategory: { type: String, index: true }, // e.g., "girls-cloths", "boys-cloth", "winterwear"

    product_info: {
      brand: { type: String },
      manufacturer: { type: String },
      
      // Kids Clothing specific fields
      clothingType: { type: String, required: true }, // T-shirt, Dress, Shorts, Pants, Shirt, Skirt, Jacket, Sweater
      gender: { type: String }, // Boys, Girls, Unisex
      ageGroup: { type: String }, // 0-1Y, 1-3Y, 3-5Y, 5-8Y, 8-12Y
      availableSizes: { type: [String], default: [] },
      fabric: { type: String },
      color: { type: String },
      
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
kidsClothingSchema.virtual("price").get(function () {
  const discount = (this.mrp * this.discountPercent) / 100;
  return Math.round(this.mrp - discount);
});

// Indexes for faster queries
kidsClothingSchema.index({ category: 1, subcategory: 1 });
kidsClothingSchema.index({ 'product_info.clothingType': 1 });
kidsClothingSchema.index({ 'product_info.gender': 1 });
kidsClothingSchema.index({ 'product_info.ageGroup': 1 });
kidsClothingSchema.index({ createdAt: -1 });

export const KidsClothing = mongoose.model("KidsClothing", kidsClothingSchema);

