import { Router } from 'express';
import { getPolicies, getPolicyByType } from '../controllers/policy.controller.js';

const router = Router();

// Public routes
router.get('/', getPolicies);
router.get('/:type', getPolicyByType);

export default router;







