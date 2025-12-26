import React, { useState, useEffect } from 'react';

const LoginOTP = () => {
  const [step, setStep] = useState(1); // 1: Phone input, 2: OTP input
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Use environment variable for OTP server URL, fallback to backend URL or localhost
  const API_BASE = import.meta.env.VITE_OTP_SERVER_URL || 
                   import.meta.env.VITE_BACKEND_URL || 
                   'http://localhost:4000';

  // Resend OTP timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setSuccess('OTP sent to your mobile number');
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setSuccess('Login successful! Redirecting...');
      
      // Store token in localStorage (optional, cookie is already set)
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP resent to your mobile number');
      setResendTimer(30);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
    setResendTimer(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent mb-2">
              TurbooToys
            </h1>
            <p className="text-gray-600">Login with OTP</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Step 1: Phone Input */}
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Input */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enter the 6-digit OTP sent to {phone}
                </p>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-semibold text-rose-500">{resendTimer}</span> sec
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-rose-500 hover:text-rose-600 font-semibold transition-colors disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Change Number */}
              <button
                type="button"
                onClick={handleChangeNumber}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Change mobile number
              </button>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );
};

export default LoginOTP;

