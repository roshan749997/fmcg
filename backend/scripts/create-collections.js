import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/DataBaseConnection.js';
import { KidsClothing } from '../models/KidsClothing.js';
import { Footwear } from '../models/Footwear.js';
import { KidsAccessories } from '../models/KidsAccessories.js';
import { BabyCare } from '../models/BabyCare.js';
import { Toys } from '../models/Toys.js';

configDotenv();

// Create collections by inserting and immediately deleting a dummy document
const createCollection = async (Model, collectionName, categoryDefault) => {
  try {
    // Get the actual collection name from the model
    const actualCollectionName = Model.collection.name;
    
    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: actualCollectionName }).toArray();
    
    if (collections.length === 0) {
      console.log(`Creating collection: ${actualCollectionName}`);
      
      // Create a dummy document to initialize the collection
      const dummyDoc = new Model({
        title: 'Dummy Product - Delete Me',
        mrp: 0,
        discountPercent: 0,
        description: 'This is a dummy document to create the collection. Please delete this.',
        category: categoryDefault,
        product_info: {
          brand: 'Dummy',
          manufacturer: 'Dummy',
        },
        images: {
          image1: 'https://via.placeholder.com/300',
        },
      });
      
      // Save to create collection
      await dummyDoc.save();
      console.log(`✅ Collection ${actualCollectionName} created`);
      
      // Delete the dummy document
      await Model.deleteOne({ title: 'Dummy Product - Delete Me' });
      console.log(`✅ Dummy document deleted from ${actualCollectionName}`);
    } else {
      console.log(`✅ Collection ${actualCollectionName} already exists`);
    }
  } catch (error) {
    console.error(`❌ Error creating collection ${collectionName}:`, error.message);
  }
};

const createAllCollections = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB(process.env.MONGODB_URI || '');
    console.log('✅ Connected to database\n');
    
    console.log('Creating category-specific collections...\n');
    
    // Create all collections with their default category values
    await createCollection(KidsClothing, 'KidsClothing', 'kids-clothing');
    await createCollection(Footwear, 'Footwear', 'footwear');
    await createCollection(KidsAccessories, 'KidsAccessories', 'kids-accessories');
    await createCollection(BabyCare, 'BabyCare', 'baby-care');
    await createCollection(Toys, 'Toys', 'toys');
    
    console.log('\n✅ All collections created successfully!');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 All collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
createAllCollections();

export default createAllCollections;

