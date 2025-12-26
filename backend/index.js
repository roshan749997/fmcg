import { configDotenv } from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport, { setupPassport } from './config/passport.js';

import authRoutes from './routes/auth.routes.js';
// OTP routes are already included in auth.routes.js, no need to import separately
import headerRoutes from './routes/header.routes.js';
import productRoutes from './routes/product.routes.js';
// Category-specific routes for better performance
import kidsClothingRoutes from './routes/kidsClothing.routes.js';
import footwearRoutes from './routes/footwear.routes.js';
import kidsAccessoriesRoutes from './routes/kidsAccessories.routes.js';
import babyCareRoutes from './routes/babyCare.routes.js';
import toysRoutes from './routes/toys.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import addressRoutes from './routes/address.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import adminRoutes from './routes/admin.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import policyRoutes from './routes/policy.routes.js';
import contactInfoRoutes from './routes/contactInfo.routes.js';
import categoryRoutes from './routes/category.routes.js';
import logoRoutes from './routes/logo.routes.js';

import connectDB from './config/DataBaseConnection.js';
import cookieJwtAuth from './middleware/authMiddleware.js';

configDotenv();

console.log(
  'Razorpay env loaded:',
  Boolean(process.env.RAZORPAY_KEY_ID),
  Boolean(process.env.RAZORPAY_KEY_SECRET)
);

const server = express();

// When behind proxy (Render)
server.set('trust proxy', 1);

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
server.use(
  cors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

server.use(express.json({ limit: '10mb' })); // Increase limit to handle base64 images
server.use(express.urlencoded({ extended: true, limit: '10mb' }));
server.use(cookieParser());

// Initialize Passport
setupPassport();
server.use(passport.initialize());

// Health check
server.get('/api/health', (req, res) => res.json({ ok: true }));

// Current user route (cookie + JWT)
server.get('/api/me', cookieJwtAuth, (req, res) => {
  res.json({ user: req.user });
});

// Routes
server.use('/api/auth', authRoutes);
// OTP routes are already included in auth.routes.js
server.use('/api/header', headerRoutes);
server.use('/api/products', productRoutes); // Legacy route - kept for backward compatibility
// Category-specific routes for better performance
server.use('/api/kids-clothing', kidsClothingRoutes);
server.use('/api/footwear', footwearRoutes);
server.use('/api/kids-accessories', kidsAccessoriesRoutes);
server.use('/api/baby-care', babyCareRoutes);
server.use('/api/toys', toysRoutes);
server.use('/api/cart', cartRoutes);
server.use('/api/payment', paymentRoutes);
server.use('/api/address', addressRoutes);
server.use('/api/orders', ordersRoutes);
server.use('/api/admin', adminRoutes);
server.use('/api/wishlist', wishlistRoutes);
server.use('/api/policies', policyRoutes);
server.use('/api/contact-info', contactInfoRoutes);
server.use('/api/categories', categoryRoutes);
server.use('/api/logos', logoRoutes);

const PORT = process.env.PORT || 5000;

// Connect DB
await connectDB(process.env.MONGODB_URI || '');

// Start server
server.listen(PORT, () => {
  console.log('Server is running at', PORT);
});
