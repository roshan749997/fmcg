import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },                  // Product title
    mrp: { type: Number, required: true },                    // MRP (maximum retail price)
    discountPercent: { type: Number, default: 0, min: 0, max: 100 }, // Discount in %
    description: { type: String },
    category: { type: String, required: true, index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },

    product_info: {
      brand: { type: String },
      manufacturer: { type: String },
      // For Shoes
      availableSizes: { type: [String], default: [] }, // e.g., ["7", "8", "9", "10"] or ["EU 42", "US 9"]
      shoeSize: { type: String }, // Legacy field - kept for backward compatibility
      shoeMaterial: { type: String }, // e.g., "Leather", "Canvas", "Mesh"
      shoeColor: { type: String },
      shoeType: { type: String }, // e.g., "Sneakers", "Formal", "Sports", "Casual", "Boots"
      // For Watches
      watchBrand: { type: String },
      movementType: { type: String }, // e.g., "Quartz", "Automatic", "Mechanical"
      caseMaterial: { type: String }, // e.g., "Stainless Steel", "Titanium", "Ceramic"
      bandMaterial: { type: String }, // e.g., "Leather", "Metal", "Rubber", "Fabric"
      waterResistance: { type: String }, // e.g., "50m", "100m", "200m"
      watchType: { type: String }, // e.g., "Analog", "Digital", "Smart Watch"
      IncludedComponents: { type: String },
    },

    images: {
      image1: { type: String, required: true },
      image2: { type: String },
      image3: { type: String },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 💡 Virtual field: Automatically calculate final price after discount
productSchema.virtual("price").get(function () {
  const discount = (this.mrp * this.discountPercent) / 100;
  return Math.round(this.mrp - discount);
});

export const Product = mongoose.model("Product", productSchema);
