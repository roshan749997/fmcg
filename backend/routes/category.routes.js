import { Router } from 'express';
import { getAllCategories } from '../controllers/category.controller.js';

const router = Router();

// Get all categories with subcategories (public endpoint)
router.get('/', getAllCategories);

export default router;







