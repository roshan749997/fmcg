import mongoose from "mongoose";

const toysSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String },
    category: { type: String, default: 'toys', index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },
    subcategory: { type: String, index: true },

    product_info: {
      brand: { type: String },
      manufacturer: { type: String },
      
      // Toys specific fields
      toyType: { type: String, required: true }, // Car, Puzzle, Soft Toy, Action Figure, Board Game, Doll, Building Blocks, Educational Toy
      batteryRequired: { type: Boolean, default: false },
      batteryIncluded: { type: Boolean, default: false },
      ageGroup: { type: String, index: true }, // Recommended age group
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
toysSchema.virtual("price").get(function () {
  const discount = (this.mrp * this.discountPercent) / 100;
  return Math.round(this.mrp - discount);
});

// Indexes for faster queries
toysSchema.index({ category: 1, subcategory: 1 });
toysSchema.index({ 'product_info.toyType': 1 });
toysSchema.index({ 'product_info.batteryRequired': 1 });
toysSchema.index({ createdAt: -1 });

export const Toys = mongoose.model("Toys", toysSchema);

