import { Router } from 'express';
import { getHeaderData, searchProducts } from '../controllers/header.controller.js';

const router = Router();

// Get all header data (categories, navigation, etc.)
router.get('/', getHeaderData);

// Search products
router.get('/search', searchProducts);

export default router;
