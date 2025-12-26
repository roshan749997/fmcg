import { Router } from 'express';
import { createOrder, verifyPayment, createCodOrder } from '../controllers/payment.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/orders', createOrder);
router.post('/verify', auth, verifyPayment);
router.post('/cod', auth, createCodOrder);

export default router;
