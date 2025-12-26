import jwt from 'jsonwebtoken';
import { otpStore, hashOTP } from './sendOtp.js';
import User from '../models/User.js';

/**
 * Verify OTP and generate JWT token
 */
export async function verifyOtp(req, res) {
  try {
    // Accept both 'phone' and 'mobile' for compatibility
    const phone = req.body.phone || req.body.mobile;
    const otp = req.body.otp;

    // Validation
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 6 digits',
      });
    }

    // Get stored OTP data
    const storedData = otpStore.get(phone);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP',
      });
    }

    // Check expiry
    if (Date.now() > storedData.expiry) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP',
      });
    }

    // Verify OTP
    const hashedInputOTP = hashOTP(otp);
    if (hashedInputOTP !== storedData.hashedOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // OTP verified successfully - remove from store
    otpStore.delete(phone);

    // Find or create user by phone number
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new user with phone number
      user = await User.create({
        name: `User ${phone.slice(-4)}`, // Default name with last 4 digits
        phone,
        provider: 'otp',
      });
      console.log('New user created via OTP:', { id: String(user._id), phone: user.phone });
    } else {
      // Update user if phone was not set or provider needs update
      if (!user.phone) {
        user.phone = phone;
      }
      if (user.provider !== 'otp') {
        user.provider = 'otp';
      }
      await user.save();
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    const token = jwt.sign(
      {
        id: String(user._id),
        phone: user.phone,
        email: user.email,
        isAdmin: !!user.isAdmin,
        type: 'otp_login',
      },
      jwtSecret,
      {
        expiresIn: '7d',
      }
    );

    // Set HttpOnly cookie (using 'jwt' to match Google OAuth)
    const isProd = process.env.NODE_ENV === 'production' || (process.env.BACKEND_URL || '').startsWith('https://');
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: !!user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

