import express from 'express';
import { getBabyCareProducts, getBabyCareProductById } from '../controllers/babyCare.controller.js';

const router = express.Router();

// GET /api/baby-care - Get all baby care products or filter by subcategory
router.get('/', getBabyCareProducts);

// GET /api/baby-care/:id - Get a single baby care product by ID
router.get('/:id', getBabyCareProductById);

export default router;
