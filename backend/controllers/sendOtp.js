import crypto from 'crypto';
import axios from 'axios';

// In-memory OTP store (Use Redis in production)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP using SHA-256
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Send OTP via Fast2SMS
 */
export async function sendOtp(req, res) {
  try {
    // Accept both 'phone' and 'mobile' for compatibility
    const phone = req.body.phone || req.body.mobile;

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits starting with 6-9',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store hashed OTP with expiry
    otpStore.set(phone, {
      hashedOTP,
      expiry,
    });

    // Send OTP via Fast2SMS
    // API URL must be EXACT with no trailing slash
    const fast2smsUrl = 'https://www.fast2sms.com/dev/bulkV2';
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      console.error('FAST2SMS_API_KEY is not set');
      return res.status(500).json({
        success: false,
        message: 'SMS service configuration error',
      });
    }

    try {
      // Create URLSearchParams for form-urlencoded format
      // Using Quick Route (route = "q") - NO DLT
      const params = new URLSearchParams();
      params.append('route', 'q');
      params.append('message', `Your SaariSanskar OTP is ${otp}`);
      params.append('numbers', phone);

      const smsResponse = await axios.post(
        fast2smsUrl,
        params.toString(), // Send as URL-encoded string
        {
          headers: {
            authorization: apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('Fast2SMS Response:', smsResponse.data);

      // Check if SMS was sent successfully
      if (smsResponse.data.return === true) {
        return res.json({
          success: true,
          message: 'OTP sent successfully',
        });
      } else {
        throw new Error(smsResponse.data.message || 'Failed to send OTP');
      }
    } catch (smsError) {
      // Properly log Fast2SMS errors from response.data
      if (smsError.response) {
        console.error('Fast2SMS API Error Response:', {
          status: smsError.response.status,
          statusText: smsError.response.statusText,
          data: smsError.response.data,
        });
      } else if (smsError.request) {
        console.error('Fast2SMS API Error - No response received:', smsError.message);
      } else {
        console.error('Fast2SMS API Error:', smsError.message);
      }
      
      // Remove OTP from store if SMS failed
      otpStore.delete(phone);
      
      // Extract error message from Fast2SMS response.data
      const errorMessage = smsError.response?.data?.message || 
                           smsError.response?.data?.msg || 
                           smsError.message || 
                           'Failed to send OTP. Please try again.';
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

// Export otpStore for use in verifyOtp
export { otpStore, hashOTP };

