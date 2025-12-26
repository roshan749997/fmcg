import mongoose from 'mongoose';
import { Product } from '../models/product.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import connectDB from '../config/DataBaseConnection.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateWatchesToAccessories() {
  try {
    await connectDB(process.env.MONGODB_URI || '');
    console.log('Connected to database');

    // Find all products with category "Watches" or watch-related fields
    const watchProducts = await Product.find({
      $or: [
        { category: { $regex: /watch/i } },
        { category: { $regex: /accessories/i } },
        { 'product_info.watchType': { $exists: true } },
        { 'product_info.watchBrand': { $exists: true } }
      ]
    });

    console.log(`Found ${watchProducts.length} watch/accessory products to migrate`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of watchProducts) {
      try {
        // Check if already migrated
        const existing = await KidsAccessories.findOne({ _id: product._id });
        if (existing) {
          console.log(`Product ${product._id} already exists in KidsAccessories, skipping...`);
          skipped++;
          continue;
        }

        // Determine accessoryType
        let accessoryType = product.product_info?.accessoryType || '';
        if (!accessoryType) {
          if (product.product_info?.watchType || product.product_info?.watchBrand) {
            accessoryType = 'Watch';
          } else {
            accessoryType = 'Accessory';
          }
        }

        // Create new product in KidsAccessories collection
        const newProduct = {
          _id: product._id,
          title: product.title,
          mrp: product.mrp,
          discountPercent: product.discountPercent || 0,
          description: product.description || '',
          category: 'kids-accessories',
          categoryId: product.categoryId,
          subcategory: product.subcategory || '',
          product_info: {
            brand: product.product_info?.brand || '',
            manufacturer: product.product_info?.manufacturer || '',
            accessoryType: accessoryType,
            material: product.product_info?.material || 
                     product.product_info?.bandMaterial || 
                     product.product_info?.caseMaterial || '',
            color: product.product_info?.color || '',
            availableSizes: product.product_info?.availableSizes || [],
            includedComponents: product.product_info?.includedComponents || 
                               product.product_info?.IncludedComponents || '',
            // Keep legacy fields for reference
            watchBrand: product.product_info?.watchBrand || '',
            movementType: product.product_info?.movementType || '',
            caseMaterial: product.product_info?.caseMaterial || '',
            bandMaterial: product.product_info?.bandMaterial || '',
            waterResistance: product.product_info?.waterResistance || '',
            watchType: product.product_info?.watchType || '',
          },
          images: product.images || {},
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };

        await KidsAccessories.create(newProduct);
        console.log(`✓ Migrated: ${product.title} (${product._id})`);
        migrated++;
      } catch (error) {
        console.error(`✗ Error migrating product ${product._id}:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total products found: ${watchProducts.length}`);
    console.log(`Successfully migrated: ${migrated}`);
    console.log(`Skipped (already exists): ${skipped}`);
    console.log(`Errors: ${errors}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateWatchesToAccessories();

