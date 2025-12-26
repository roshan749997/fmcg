import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function cookieJwtAuth(req, res, next) {
  try {
    // Check Authorization header FIRST (for email/password login)
    // This ensures email/password login takes priority over old cookies
    let token = null;
    let tokenSource = null;
    
    const header = req.headers.authorization || '';
    if (header) {
      const parts = header.split(' ');
      token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;
      if (token) {
        tokenSource = 'header';
        console.log('[cookieJwtAuth] Token found in Authorization header (email/password login)');
      }
    }
    
    // If no Authorization header, check cookies (for Google OAuth and OTP login)
    if (!token) {
      token = req.cookies?.jwt || req.cookies?.token;
      if (token) {
        tokenSource = 'cookie';
        console.log('[cookieJwtAuth] Token found in cookie (Google/OTP login)');
      }
    }
    
    if (!token) {
      console.log('[cookieJwtAuth] No token found - cookies:', Object.keys(req.cookies || {}), 'auth header:', req.headers.authorization ? 'present' : 'missing');
      return res.status(401).json({ message: 'No auth token' });
    }
    
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    const userId = payload.id || payload._id || payload.userId;
    
    if (!userId) {
      console.log('[cookieJwtAuth] Invalid token payload:', payload);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.log('[cookieJwtAuth] Token verified, userId:', userId);
    
    // Select all user fields needed for profile
    const user = await User.findById(userId).select('name email phone isAdmin googleId avatar provider createdAt updatedAt');
    if (!user) {
      console.log('[cookieJwtAuth] User not found for userId:', userId);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('[cookieJwtAuth] User found:', { id: String(user._id), name: user.name, email: user.email });
    
    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (e) {
    console.error('[cookieJwtAuth] Error:', e.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
