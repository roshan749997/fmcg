import { Router } from 'express';
import cookieJwtAuth from '../middleware/authMiddleware.js';
import { addToWishlist, removeFromWishlist, getWishlist } from '../controllers/wishlist.controller.js';

const router = Router();

// POST /api/wishlist/add
router.post('/add', cookieJwtAuth, addToWishlist);

// DELETE /api/wishlist/remove/:productId
router.delete('/remove/:productId', cookieJwtAuth, removeFromWishlist);

// GET /api/wishlist
router.get('/', cookieJwtAuth, getWishlist);

export default router;

