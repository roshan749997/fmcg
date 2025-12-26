import express from 'express';
import { getToysProducts, getToysProductById } from '../controllers/toys.controller.js';

const router = express.Router();

// GET /api/toys - Get all toys products or filter by subcategory
router.get('/', getToysProducts);

// GET /api/toys/:id - Get a single toys product by ID
router.get('/:id', getToysProductById);

export default router;
