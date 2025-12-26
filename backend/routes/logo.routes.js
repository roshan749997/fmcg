import { Router } from 'express';
import { getLogos, getLogoByType } from '../controllers/logo.controller.js';

const router = Router();

// Public routes
router.get('/', getLogos);
router.get('/:type', getLogoByType);

export default router;







