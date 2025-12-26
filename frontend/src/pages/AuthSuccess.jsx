import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ScrollToTop from '../components/ScrollToTop';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const run = async () => {
      try {
        // Call api.me() with credentials to get user data from cookie
        const data = await api.me();
        const user = data?.user || null;
        
        console.log('[AuthSuccess] User data received:', user ? 'yes' : 'no', user?.email);
        
        // Set auth token marker for cookie-based auth
        try { 
          localStorage.setItem('auth_token', 'cookie');
          
          // Store user data in localStorage for Navbar and other components
          if (user) {
            localStorage.setItem('user_data', JSON.stringify({ user }));
          }
          
          // Set admin status
          if (user?.isAdmin) {
            localStorage.setItem('auth_is_admin', 'true');
            console.log('[AuthSuccess] Admin user detected');
          } else {
            localStorage.removeItem('auth_is_admin');
          }
          
          // Dispatch storage event to notify Navbar and other components
          window.dispatchEvent(new Event('storage'));
          // Also trigger a custom event for immediate update
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: true, user } }));
        } catch (storageErr) {
          console.error('[AuthSuccess] Storage error:', storageErr);
        }
      } catch (err) {
        console.error('[AuthSuccess] API error:', err);
        // Even if api.me() fails, set the cookie marker since cookie is set by backend
        try { 
          localStorage.setItem('auth_token', 'cookie');
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: true } }));
        } catch (storageErr) {
          console.error('[AuthSuccess] Storage error on fallback:', storageErr);
        }
      }
      
      // Small delay to ensure localStorage is set before redirect
      setTimeout(() => {
        const redirectTo = location.state?.from?.pathname || '/';
        console.log('[AuthSuccess] Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true });
      }, 100);
    };
    run();
  }, [navigate, location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
        <div className="text-gray-700">Signing you in…</div>
      </div>
      <ScrollToTop />
    </div>
  );
}
