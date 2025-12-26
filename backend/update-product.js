import mongoose from "mongoose";
import { Product } from './models/product.js';

mongoose.connect('mongodb+srv://avcoe55_db_user:1So8J9LI3I3iBlAu@cluster0.yp9u2ft.mongodb.net/Kidzo?appName=Cluster0')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Update the product with correct image structure
  await Product.updateOne(
    { title: 'Nike Air Max 270 Sneakers' },
    { 
      $set: { 
        'images': [
          { url: 'https://example.com/nike-air-max-270-1.jpg' },
          { url: 'https://example.com/nike-air-max-270-2.jpg' },
          { url: 'https://example.com/nike-air-max-270-3.jpg' }
        ]
      }
    }
  );
  
  console.log('Product updated successfully');
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
