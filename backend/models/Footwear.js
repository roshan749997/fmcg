import mongoose from "mongoose";

const footwearSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    category: { type: String, default: 'footwear', index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },
    subcategory: { type: String, index: true }, // e.g., "boys-footwear", "girls-footwear"

    product_info: {
      brand: { type: String },
      manufacturer: { type: String },
      
      // Footwear specific fields
      footwearType: { type: String, required: true }, // Shoes, Sandals, Slippers, Boots, Sneakers
      shoeMaterial: { type: String },
      soleMaterial: { type: String },
      availableSizes: { type: [String], default: [] },
      color: { type: String, index: true },
      
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
footwearSchema.virtual("price").get(function () {
  const discount = (this.mrp * this.discountPercent) / 100;
  return Math.round(this.mrp - discount);
});

// Indexes for faster queries
footwearSchema.index({ category: 1, subcategory: 1 });
footwearSchema.index({ 'product_info.footwearType': 1 });
footwearSchema.index({ 'product_info.shoeMaterial': 1 });
footwearSchema.index({ createdAt: -1 });

export const Footwear = mongoose.model("Footwear", footwearSchema);

