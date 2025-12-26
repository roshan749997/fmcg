import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getWishlist, addToWishlist, removeFromWishlist, getWishlistCount } from '../controllers/wishlist.controller.js';

const router = Router();

// All routes require authentication
router.get('/', auth, getWishlist);
router.post('/add', auth, addToWishlist);
router.delete('/remove/:productId', auth, removeFromWishlist);
router.get('/count', auth, getWishlistCount);

export default router;









