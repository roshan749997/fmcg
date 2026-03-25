import mongoose from "mongoose";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseRupeeValue = (value) => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const numeric = String(value).replace(/[^0-9.]/g, "");
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
};

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },                  // Product title
    mrp: { type: Number, required: true },                    // MRP (maximum retail price)
    discountPercent: { type: Number, default: 0, min: 0, max: 100 }, // Discount in %
    description: { type: String },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: "", index: true },
    subSubCategory: { type: String, default: "", index: true },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      index: true 
    },
    taxonomy: {
      mainCategory: { type: String, default: "", index: true },
      mainCategorySlug: { type: String, default: "", index: true },
      subCategory: { type: String, default: "", index: true },
      subCategorySlug: { type: String, default: "", index: true },
      subSubCategory: { type: String, default: "", index: true },
      subSubCategorySlug: { type: String, default: "", index: true },
    },
    sourceData: {
      source: { type: String, default: "manual" },
      productLink: { type: String, default: "" },
      eanCode: { type: String, default: "", index: true },
      skuName: { type: String, default: "" },
      skuSize: { type: String, default: "" },
      imageLink: { type: String, default: "" },
      aboutProduct: { type: String, default: "" },
      raw: { type: mongoose.Schema.Types.Mixed, default: null },
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

productSchema.pre("validate", function setDatasetDerivedFields(next) {
  this.mrp = parseRupeeValue(this.mrp);

  if (!this.description && this.sourceData?.aboutProduct) {
    this.description = this.sourceData.aboutProduct;
  }

  if (!this.title && this.sourceData?.skuName) {
    this.title = this.sourceData.skuName;
  }

  if (this.taxonomy?.mainCategory && !this.category) {
    this.category = this.taxonomy.mainCategory;
  }
  if (this.taxonomy?.subCategory && !this.subcategory) {
    this.subcategory = this.taxonomy.subCategory;
  }
  if (this.taxonomy?.subSubCategory && !this.subSubCategory) {
    this.subSubCategory = this.taxonomy.subSubCategory;
  }

  if (!this.taxonomy) this.taxonomy = {};
  this.taxonomy.mainCategorySlug = slugify(this.taxonomy.mainCategory || this.category || "");
  this.taxonomy.subCategorySlug = slugify(this.taxonomy.subCategory || this.subcategory || "");
  this.taxonomy.subSubCategorySlug = slugify(this.taxonomy.subSubCategory || this.subSubCategory || "");

  if (!this.images) this.images = {};
  if (!this.images.image1 && this.sourceData?.imageLink) {
    this.images.image1 = this.sourceData.imageLink;
  }

  next();
});

export const Product = mongoose.model("Product", productSchema);
