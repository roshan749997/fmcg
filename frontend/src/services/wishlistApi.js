import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

const tokenHeaders = () => {
  try {
    const token = localStorage.getItem('auth_token');
    // Some auth flows store a marker in localStorage instead of a real JWT.
    if (!token || token === 'cookie') return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allow cookie-based auth as well
});

export const wishlistApi = {
  addToWishlist: async (productId) => {
    const { data } = await client.post(
      '/api/wishlist/add',
      { productId },
      { headers: tokenHeaders() }
    );
    return data;
  },

  removeFromWishlist: async (productId) => {
    const { data } = await client.delete(`/api/wishlist/remove/${productId}`, {
      headers: tokenHeaders(),
    });
    return data;
  },

  getWishlist: async () => {
    const { data } = await client.get('/api/wishlist', { headers: tokenHeaders() });
    console.log('Wishlist data:', data.products);
    return data.products;
  },
};

