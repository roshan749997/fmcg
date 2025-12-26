import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import { signup, signin, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { sendOtp } from '../controllers/sendOtp.js';
import { verifyOtp } from '../controllers/verifyOtp.js';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OTP Login Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email phone isAdmin googleId avatar provider createdAt updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// Update user profile (including avatar)
router.patch('/me', auth, async (req, res) => {
  try {
    console.log('[PATCH /api/auth/me] Request received:', {
      userId: req.userId,
      hasAvatar: !!req.body.avatar,
      avatarLength: req.body.avatar ? req.body.avatar.length : 0
    });
    
    const { avatar } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('[PATCH /api/auth/me] User not found:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (avatar !== undefined) {
      user.avatar = avatar;
      console.log('[PATCH /api/auth/me] Avatar updated for user:', req.userId);
    }
    
    await user.save();
    const updatedUser = await User.findById(req.userId).select('name email phone isAdmin googleId avatar provider createdAt updatedAt');
    console.log('[PATCH /api/auth/me] Profile updated successfully');
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (e) {
    console.error('[PATCH /api/auth/me] Error:', e);
    res.status(500).json({ message: 'Failed to update profile', error: e.message });
  }
});

/* ------------------------------------------
   GOOGLE OAUTH 2.0 FIXED CONFIGURATION
--------------------------------------------- */

// FRONTEND that user should be redirected to AFTER login  
// (Production + Local supported)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// JWT used by Google login
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// 🔹 Step 1: Google Login (Triggers Google Consent Screen)
router.get(
  '/google',
  (req, res, next) => {
    // Check if Google OAuth is configured
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log('[Google OAuth] Login attempt:', {
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      frontendUrl: FRONTEND_URL,
      referer: req.get('referer'),
      origin: req.get('origin'),
    });
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('[Google OAuth] Missing credentials - Client ID or Secret not configured');
      return res.redirect(`${FRONTEND_URL}/auth/failure?error=${encodeURIComponent('Google OAuth is not configured. Please contact support.')}`);
    }
    
    next();
  },
  (req, res, next) => {
    // Log before redirecting to Google
    console.log('[Google OAuth] Redirecting to Google consent screen');
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res, next);
  }
);

// 🔹 Step 2: Google Callback (this MUST match GOOGLE_CALLBACK_URL)
router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('[Google OAuth] Callback received:', {
      query: req.query,
      hasCode: !!req.query.code,
      hasError: !!req.query.error,
      error: req.query.error,
      state: req.query.state,
    });
    
    passport.authenticate('google', {
      failureRedirect: `${FRONTEND_URL}/auth/failure`,
      session: false,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        console.error('[Google OAuth] No user object after authentication');
        return res.redirect(`${FRONTEND_URL}/auth/failure?error=${encodeURIComponent('Authentication failed: User not found')}`);
      }

      console.log('[Google OAuth] User authenticated:', {
        userId: String(user._id),
        email: user.email,
        name: user.name,
      });

      // Create JWT token
      const token = jwt.sign(
        { id: String(user._id), email: user.email, isAdmin: !!user.isAdmin },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Environment-based cookie behavior
      const isProd =
        process.env.NODE_ENV === 'production' ||
        (process.env.BACKEND_URL || '').startsWith('https://');
      
      // Check COOKIE_SECURE env var (can be 'true', 'false', or undefined)
      const cookieSecure = process.env.COOKIE_SECURE === 'true' ? true : 
                           process.env.COOKIE_SECURE === 'false' ? false : 
                           isProd;
      
      // For sameSite: 'none', secure must be true
      const cookieSameSite = cookieSecure ? 'none' : 'lax';

      console.log('[Google OAuth] Setting cookie:', {
        secure: cookieSecure,
        sameSite: cookieSameSite,
        isProd,
        frontendUrl: FRONTEND_URL,
      });

      // Set Cookie for authentication
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: cookieSameSite,
        secure: cookieSecure,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/', // Ensure cookie is available across all paths
        domain: process.env.COOKIE_DOMAIN || undefined, // Allow domain override if needed
      });

      // 🔥 FINAL REDIRECT AFTER SUCCESSFUL GOOGLE LOGIN
      // Sends the user to frontend with success page
      console.log('[Google OAuth] Redirecting to success page:', `${FRONTEND_URL}/auth/success`);
      return res.redirect(`${FRONTEND_URL}/auth/success`);
    } catch (e) {
      console.error("[Google OAuth] Error in callback handler:", e);
      console.error("[Google OAuth] Error stack:", e.stack);
      const errorMessage = encodeURIComponent(e.message || 'Authentication failed');
      return res.redirect(`${FRONTEND_URL}/auth/failure?error=${errorMessage}`);
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  // Clear cookie with all possible configurations to ensure it's cleared
  const cookieOptions = [
    { httpOnly: true, sameSite: 'lax', secure: false, path: '/' },
    { httpOnly: true, sameSite: 'none', secure: true, path: '/' },
    { httpOnly: true, sameSite: 'strict', secure: false, path: '/' },
  ];
  
  cookieOptions.forEach(options => {
    res.clearCookie('jwt', options);
  });
  
  // Also clear token cookie (if it exists)
  cookieOptions.forEach(options => {
    res.clearCookie('token', options);
  });
  
  console.log('[Logout] Cookies cleared');
  return res.json({ message: 'Logged out successfully' });
});

export default router;
