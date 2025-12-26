// src/utils/api.js

// Prefer VITE_BACKEND_URL. If not set, fall back to localhost:5000 for development.
// Make sure VITE_BACKEND_URL is defined for production builds (Vite requires VITE_ prefix).
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
console.log('API_BASE_URL', API_BASE_URL);

function buildUrl(path) {
  // ensure path begins with /
  if (!path.startsWith('/')) path = `/${path}`;
  // Use URL to safely join base + path
  try {
    return new URL(path, API_BASE_URL).toString();
  } catch {
    // fallback (if API_BASE_URL empty)
    return `${API_BASE_URL}${path}`;
  }
}

async function request(path, options = {}) {
  const url = buildUrl(path);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  // cookie session marker: token === 'cookie'
  const isCookieSession = token === 'cookie';
  // For tokens which are JWT-like we expect a dot (.), but don't rely solely on that. Use explicit 'cookie' marker in your app.
  const headers = { ...(options.headers || {}) };

  const body = options.body;
  // If body is FormData, don't set Content-Type — the browser sets the boundary automatically.
  if (!(body instanceof FormData)) {
    // set Content-Type only if not already provided
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  // Only add Authorization header if not already set in options.headers
  // This allows api.me() to explicitly set it for email/password login
  if (!isCookieSession && token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build final fetch options
  // Respect explicit credentials from options, otherwise use cookie session logic
  const fetchOpts = {
    ...options,
    headers,
    // Use explicit credentials if provided, otherwise use cookie session logic
    credentials: options.credentials ?? (isCookieSession ? 'include' : 'same-origin'),
  };

  // Avoid sending body on GET/HEAD
  if (fetchOpts.method && ['GET', 'HEAD'].includes(fetchOpts.method.toUpperCase())) {
    delete fetchOpts.body;
  }

  const res = await fetch(url, fetchOpts);

  // handle no-content responses (204)
  if (res.status === 204) return {};

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

  if (!res.ok) {
    // Attach status to the error for easier debugging
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

export const api = {
  signin: (payload) => request('/api/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (payload) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),

  // OTP Login endpoints
  sendOtp: (mobile) => request('/api/auth/send-otp', { 
    method: 'POST', 
    body: JSON.stringify({ mobile }),
    credentials: 'include',
  }),
  verifyOtp: ({ mobile, otp }) => request('/api/auth/verify-otp', { 
    method: 'POST', 
    body: JSON.stringify({ mobile, otp }),
    credentials: 'include',
  }),

  me: async () => {
    try {
      // Use credentials: 'include' to send cookies for Google OAuth
      // Also send Authorization header if token exists (for email/password login)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const isCookieSession = token === 'cookie';
      
      console.log('[api.me] Token check:', { 
        hasToken: !!token, 
        isCookieSession, 
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none' 
      });
      
      const options = {
        method: 'GET',
        credentials: 'include', // Always include credentials for cookies
      };
      
      // If not cookie session, explicitly add Authorization header
      // This will be preserved by request() function since we check !headers.Authorization
      if (!isCookieSession && token) {
        options.headers = {
          Authorization: `Bearer ${token}`,
        };
        console.log('[api.me] Added Authorization header for email/password login');
      }
      
      const result = await request('/api/me', options);
      console.log('[api.me] Success, user data:', result?.user ? 'received' : 'missing');
      return result;
    } catch (e) {
      console.error('api.me() error:', e);
      // Fallback for older APIs
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const isCookieSession = token === 'cookie';
      
      const options = {
        method: 'GET',
        credentials: 'include',
      };
      
      if (!isCookieSession && token) {
        options.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      
      return await request('/api/auth/me', options);
    }
  },

  updateProfile: async (payload) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const isCookieSession = token === 'cookie';
      
      console.log('[api.updateProfile] Starting update:', {
        hasToken: !!token,
        isCookieSession,
        payloadKeys: Object.keys(payload),
        avatarLength: payload.avatar ? payload.avatar.length : 0
      });
      
      const options = {
        method: 'PATCH',
        body: JSON.stringify(payload),
        credentials: 'include', // Always include credentials for cookies
      };
      
      // If not cookie session, explicitly add Authorization header
      if (!isCookieSession && token) {
        options.headers = {
          Authorization: `Bearer ${token}`,
        };
        console.log('[api.updateProfile] Added Authorization header');
      } else {
        console.log('[api.updateProfile] Using cookie-based auth');
      }
      
      const result = await request('/api/auth/me', options);
      console.log('[api.updateProfile] Success:', result);
      return result;
    } catch (e) {
      console.error('[api.updateProfile] Error:', e);
      console.error('[api.updateProfile] Error details:', {
        message: e.message,
        status: e.status,
        response: e.response
      });
      throw e;
    }
  },

  // Cart endpoints
  getCart: () => request('/api/cart', { method: 'GET' }),
  addToCart: ({ productId, quantity = 1, size = null }) => request('/api/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity, size }) }),
  removeFromCart: (productId, size = null) => {
    const url = size ? `/api/cart/remove/${productId}?size=${encodeURIComponent(size)}` : `/api/cart/remove/${productId}`;
    return request(url, { method: 'DELETE' });
  },
  updateCartQuantity: ({ productId, quantity, size = null }) => request('/api/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity, size }) }),

  // Public policy and contact info endpoints
  getPolicy: (type) => request(`/api/policies/${type}`, { method: 'GET' }),
  getContactInfo: () => request('/api/contact-info', { method: 'GET' }),
  getCategories: () => request('/api/categories', { method: 'GET' }),
  getLogo: (type) => request(`/api/logos/${type}`, { method: 'GET' }),

  // Admin endpoints
  admin: {
    stats: () => request('/api/admin/stats', { method: 'GET' }),
    createProduct: (payload) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    updateProduct: (id, payload) => request(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    listProducts: () => request('/api/admin/products', { method: 'GET' }),
    deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
    listOrders: () => request('/api/admin/orders', { method: 'GET' }),
    listAddresses: () => request('/api/admin/addresses', { method: 'GET' }),
    updateAddress: (id, payload) => request(`/api/admin/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    getPolicies: () => request('/api/admin/policies', { method: 'GET' }),
    updatePolicy: (type, title, content, sections) => request(`/api/admin/policies/${type}`, { method: 'PUT', body: JSON.stringify({ title, content, sections }) }),
    getContactInfo: () => request('/api/admin/contact-info', { method: 'GET' }),
    updateContactInfo: (payload) => request('/api/admin/contact-info', { method: 'PUT', body: JSON.stringify(payload) }),
    getLogos: () => request('/api/admin/logos', { method: 'GET' }),
    updateLogo: (type, url, alt, width, height) => request(`/api/admin/logos/${type}`, { method: 'PUT', body: JSON.stringify({ url, alt, width, height }) }),

    // more robust updateOrderStatus that tries multiple routes
    updateOrderStatus: async (id, status) => {
      const base = API_BASE_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const isCookieSession = token === 'cookie';
      const headers = {
        'Content-Type': 'application/json',
        ...(!isCookieSession && token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const payloadVariants = [{ status }, { orderStatus: status }];
      const opts = (method, body) => ({ method, headers, body: JSON.stringify(body), credentials: isCookieSession ? 'include' : 'same-origin' });
      const tryRoutes = [
        { path: `/api/admin/orders/${id}/status`, methods: ['PUT', 'POST', 'PATCH'] },
        { path: `/api/admin/orders/${id}`, methods: ['PATCH', 'PUT'] },
        { path: `/api/orders/${id}/status`, methods: ['PUT', 'POST', 'PATCH'] },
        { path: `/api/orders/${id}`, methods: ['PATCH', 'PUT'] },
        { path: `/api/admin/order-status/${id}`, methods: ['PUT', 'POST'] },
      ];
      let lastErr;
      for (const route of tryRoutes) {
        for (const method of route.methods) {
          for (const body of payloadVariants) {
            try {
              const url = new URL(route.path, base).toString();
              const res = await fetch(url, opts(method, body));
              const text = await res.text();
              let data; try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
              if (!res.ok) { lastErr = new Error(`${res.status} ${res.statusText} at ${url}`); continue; }
              return data;
            } catch (e) {
              lastErr = e;
            }
          }
        }
      }
      throw lastErr || new Error('Failed to update order status');
    },
  },
};

export default api;
