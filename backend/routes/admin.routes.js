import { Router } from 'express';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/admin.js';
import { createProduct, adminListProducts, deleteProductById, adminListOrders, adminStats, adminListAddresses, adminUpdateAddress, updateProduct, updateOrderStatus } from '../controllers/admin.controller.js';
import { adminGetPolicies, adminUpdatePolicy } from '../controllers/policy.controller.js';
import { adminGetContactInfo, adminUpdateContactInfo } from '../controllers/contactInfo.controller.js';
import { adminGetLogos, adminUpdateLogo } from '../controllers/logo.controller.js';

const router = Router();

// Products
router.post('/products', auth, adminOnly, createProduct);
router.get('/products', auth, adminOnly, adminListProducts);
router.patch('/products/:id', auth, adminOnly, updateProduct);
router.delete('/products/:id', auth, adminOnly, deleteProductById);

// Orders
router.get('/orders', auth, adminOnly, adminListOrders);
router.put('/orders/:id/status', auth, adminOnly, updateOrderStatus);
router.patch('/orders/:id', auth, adminOnly, updateOrderStatus);
router.put('/orders/:id', auth, adminOnly, updateOrderStatus);

// Stats
router.get('/stats', auth, adminOnly, adminStats);

// Addresses
router.get('/addresses', auth, adminOnly, adminListAddresses);
router.put('/addresses/:id', auth, adminOnly, adminUpdateAddress);
router.patch('/addresses/:id', auth, adminOnly, adminUpdateAddress);

// Policies
router.get('/policies', auth, adminOnly, adminGetPolicies);
router.put('/policies/:type', auth, adminOnly, adminUpdatePolicy);

// Contact Info
router.get('/contact-info', auth, adminOnly, adminGetContactInfo);
router.put('/contact-info', auth, adminOnly, adminUpdateContactInfo);

// Logos
router.get('/logos', auth, adminOnly, adminGetLogos);
router.put('/logos/:type', auth, adminOnly, adminUpdateLogo);

export default router;
