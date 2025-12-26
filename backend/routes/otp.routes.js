import { Router } from 'express';
import { sendOtp } from '../controllers/sendOtp.js';
import { verifyOtp } from '../controllers/verifyOtp.js';

const router = Router();

// POST /auth/send-otp
router.post('/send-otp', sendOtp);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOtp);

export default router;

