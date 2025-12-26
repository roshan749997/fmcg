import express from 'express';
import { getFootwearProducts, getFootwearProductById } from '../controllers/footwear.controller.js';

const router = express.Router();

// GET /api/footwear - Get all footwear products or filter by subcategory
router.get('/', getFootwearProducts);

// GET /api/footwear/:id - Get a single footwear product by ID
router.get('/:id', getFootwearProductById);

export default router;
