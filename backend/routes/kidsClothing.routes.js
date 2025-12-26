import express from 'express';
import { getKidsClothingProducts, getKidsClothingProductById } from '../controllers/kidsClothing.controller.js';

const router = express.Router();

// GET /api/kids-clothing - Get all kids clothing products or filter by subcategory
router.get('/', getKidsClothingProducts);

// GET /api/kids-clothing/:id - Get a single kids clothing product by ID
router.get('/:id', getKidsClothingProductById);

export default router;
