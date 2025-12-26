import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';

export default function AuthFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('Google sign-in failed');
  
  useEffect(() => {
    // Check for error message in URL params
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
    
    const t = setTimeout(() => navigate('/signin', { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <svg className="w-20 h-20 mx-auto text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-rose-600 font-bold text-xl mb-2">{errorMessage}</div>
        <div className="text-gray-600 mb-4">Please try signing in again.</div>
        <div className="text-gray-500 text-sm mb-6">Redirecting to Sign In page...</div>
        <button
          onClick={() => navigate('/signin', { replace: true })}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          Go to Sign In
        </button>
      </div>
      <ScrollToTop />
    </div>
  );
}
