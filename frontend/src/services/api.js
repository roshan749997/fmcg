// ---------------------------------------------------------
// CLEAN + CORRECT BACKEND URL HANDLING
// ---------------------------------------------------------

const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
};

// const API_URL = `${getBackendUrl()}/api`;

const API_URL = `${getBackendUrl()}/api`;

// ---------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------

// Map category names to API endpoints
const getCategoryEndpoint = (category) => {
  if (!category) return null;
  
  const catLower = category.toLowerCase().replace(/\s+/g, '-');
  
  // Map category names to endpoints
  const categoryMap = {
    'kids-clothing': '/kids-clothing',
    'kids-cloth': '/kids-clothing',
    'clothing': '/kids-clothing',
    'footwear': '/footwear',
    'shoes': '/footwear',
    'kids-accessories': '/kids-accessories',
    'accessories': '/kids-accessories',
    'baby-care': '/baby-care',
    'babycare': '/baby-care',
    'toys': '/toys',
    'toy': '/toys',
  };
  
  // Check exact match first
  if (categoryMap[catLower]) {
    return categoryMap[catLower];
  }
  
  // Check partial match
  for (const [key, endpoint] of Object.entries(categoryMap)) {
    if (catLower.includes(key) || key.includes(catLower)) {
      return endpoint;
    }
  }
  
  return null;
};

export const fetchSarees = async (category, subcategory = null) => {
  try {
    // Determine which endpoint to use based on category
    const categoryEndpoint = getCategoryEndpoint(category);
    
    let url;
    if (categoryEndpoint) {
      // Use category-specific endpoint for faster loading
      url = `${API_URL}${categoryEndpoint}`;
      const params = new URLSearchParams();
      
      // Only pass subcategory parameter, not category
      // Category is already identified by the endpoint path
      if (subcategory) {
        params.append('subcategory', subcategory);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    } else {
      // Fallback to legacy endpoint if category not recognized
      url = `${API_URL}/products`;
      const params = new URLSearchParams();
      
      if (subcategory) {
        params.append('subcategory', subcategory);
      } else if (category) {
        params.append('category', category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    console.log("Fetching products from:", url);
    console.log("Category:", category, "Subcategory:", subcategory);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        url: url,
        body: errorText,
      });
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data = await response.json();
    console.log("Products fetched:", data?.length || 0);
    if (data?.length > 0) {
      console.log("Sample product:", {
        title: data[0].title,
        category: data[0].category,
        subcategory: data[0].subcategory
      });
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty array instead of throwing error so page still loads
    return [];
  }
};


export const fetchSareeById = async (id, category = null) => {
  try {
    // Try category-specific endpoint first if category is provided
    const categoryEndpoint = category ? getCategoryEndpoint(category) : null;
    
    if (categoryEndpoint) {
      try {
        const response = await fetch(`${API_URL}${categoryEndpoint}/${id}`, {
          credentials: "include",
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.log(`Category-specific endpoint failed, trying legacy endpoint:`, err);
      }
    }
    
    // Fallback to legacy endpoint
    const response = await fetch(`${API_URL}/products/${id}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch product details");
    return response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};


// ---------------------------------------------------------
// HEADER
// ---------------------------------------------------------

export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/header`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  const data = await response.json();
  return data.navigation.categories;
};

export const searchProducts = async (query) => {
  const response = await fetch(`${API_URL}/header/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to search products");
  return response.json();
};


// ---------------------------------------------------------
// AUTH HEADERS
// ---------------------------------------------------------

const authHeaders = () => {
  const token = (() => {
    try {
      return localStorage.getItem("auth_token");
    } catch {
      return null;
    }
  })();
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// ---------------------------------------------------------
// ADDRESS
// ---------------------------------------------------------

export const getMyAddress = async () => {
  const res = await fetch(`${API_URL}/address/me`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch address");
  return res.json();
};

export const saveMyAddress = async (payload) => {
  const res = await fetch(`${API_URL}/address`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to save address");
  return res.json();
};

export const updateAddressById = async (id, payload) => {
  const res = await fetch(`${API_URL}/address/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update address");
  return res.json();
};

export const deleteAddressById = async (id) => {
  const res = await fetch(`${API_URL}/address/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete address");
  return res.json();
};


// ---------------------------------------------------------
// PAYMENT
// ---------------------------------------------------------

export const createPaymentOrder = async (amount, notes = {}) => {
  const res = await fetch(`${API_URL}/payment/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ amount, currency: "INR", notes }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create payment order");
  return res.json();
};

export const verifyPayment = async (payload) => {
  const res = await fetch(`${API_URL}/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.error || "Failed to verify payment");
    error.response = errorData;
    throw error;
  }
  return res.json();
};

export const createCodOrder = async () => {
  const res = await fetch(`${API_URL}/payment/cod`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.error || "Failed to create COD order");
    error.response = errorData;
    throw error;
  }
  return res.json();
};


// ---------------------------------------------------------
// ORDERS
// ---------------------------------------------------------

export const getMyOrders = async () => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const getOrderById = async (orderId) => {
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || "Failed to fetch order");
    error.response = errorData;
    throw error;
  }
  return res.json();
};


// ---------------------------------------------------------
// WISHLIST
// ---------------------------------------------------------

export const getWishlist = async () => {
  const res = await fetch(`${API_URL}/wishlist`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) {
    // Return empty wishlist if not authenticated or error
    if (res.status === 401) return { items: [] };
    throw new Error("Failed to fetch wishlist");
  }
  return res.json();
};

export const addToWishlist = async (productId) => {
  const res = await fetch(`${API_URL}/wishlist/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ productId }),
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please login to add to wishlist");
    throw new Error("Failed to add to wishlist");
  }
  return res.json();
};

export const removeFromWishlist = async (productId) => {
  const res = await fetch(`${API_URL}/wishlist/remove/${productId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please login");
    throw new Error("Failed to remove from wishlist");
  }
  return res.json();
};

export const getWishlistCount = async () => {
  try {
    const res = await fetch(`${API_URL}/wishlist/count`, {
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
    });
    if (!res.ok) return { count: 0 };
    const data = await res.json();
    return { count: data.count || 0 };
  } catch {
    return { count: 0 };
  }
};
