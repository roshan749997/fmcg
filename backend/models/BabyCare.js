import mongoose from "mongoose";

const babyCareSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    category: { type: String, default: 'baby-care', index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },
    subcategory: { type: String, index: true }, // e.g., "diapers", "wipes", "baby-gear"

    product_info: {
      brand: { type: String },
      manufacturer: { type: String },
      
      // Baby Care specific fields
      babyCareType: { type: String, required: true }, // Lotion, Diaper, Shampoo, Soap, Oil, Wipes, Powder, Cream
      ageRange: { type: String }, // 0-6 months, 6-12 months, 12-24 months, 0-12 months
      safetyStandard: { type: String }, // BPA Free, Dermatologically tested, Hypoallergenic, Paraben Free
      quantity: { type: String },
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
babyCareSchema.virtual("price").get(function () {
  const discount = (this.mrp * this.discountPercent) / 100;
  return Math.round(this.mrp - discount);
});

// Indexes for faster queries
babyCareSchema.index({ category: 1, subcategory: 1 });
babyCareSchema.index({ 'product_info.babyCareType': 1 });
babyCareSchema.index({ 'product_info.ageRange': 1 });
babyCareSchema.index({ 'product_info.safetyStandard': 1 });
babyCareSchema.index({ createdAt: -1 });

export const BabyCare = mongoose.model("BabyCare", babyCareSchema);

