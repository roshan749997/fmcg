import { Router } from 'express';
import { getContactInfo } from '../controllers/contactInfo.controller.js';

const router = Router();

// Public route
router.get('/', getContactInfo);

export default router;







