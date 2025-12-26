import express from 'express';
import { getKidsAccessoriesProducts, getKidsAccessoriesProductById } from '../controllers/kidsAccessories.controller.js';

const router = express.Router();

// GET /api/kids-accessories - Get all kids accessories products or filter by subcategory
router.get('/', getKidsAccessoriesProducts);

// GET /api/kids-accessories/:id - Get a single kids accessories product by ID
router.get('/:id', getKidsAccessoriesProductById);

export default router;
