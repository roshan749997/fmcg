import { configDotenv } from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import otpRoutes from './routes/otp.routes.js';

// Load environment variables
configDotenv();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OTP Auth Server is running' });
});

// Routes
app.use('/auth', otpRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OTP Auth Server running on http://localhost:${PORT}`);
  console.log(`📱 Send OTP: POST http://localhost:${PORT}/auth/send-otp`);
  console.log(`✅ Verify OTP: POST http://localhost:${PORT}/auth/verify-otp`);
});

