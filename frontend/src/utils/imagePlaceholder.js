/**
 * Generates a data URI for a placeholder image
 * Works offline - no external requests needed
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display (optional)
 * @returns {string} Data URI string
 */
export const getPlaceholderImage = (width = 300, height = 400, text = 'No Image') => {
  // Create SVG as data URI - works offline
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="14" 
        fill="#9ca3af" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Pre-defined placeholder images for common sizes
export const placeholders = {
  productList: getPlaceholderImage(300, 400, 'Image Not Available'),
  productDetail: getPlaceholderImage(600, 800, 'Image Not Available'),
  thumbnail: getPlaceholderImage(60, 80, 'No Image'),
  wishlist: getPlaceholderImage(600, 800, 'Image Not Available'),
  product: getPlaceholderImage(300, 400, 'Image Not Available'), // Alias for productList
};

/**
 * Safely gets image URL from product object
 * Handles both object format (image1, image2, image3) and array format
 * @param {Object} product - Product object
 * @param {string} imageKey - Which image to get ('image1', 'image2', 'image3', or first available)
 * @returns {string} Image URL or placeholder
 */
export const getProductImage = (product, imageKey = 'image1') => {
  if (!product) {
    return placeholders.productList;
  }

  // First check if product has direct image property (legacy support)
  if (product.image && typeof product.image === 'string') {
    return product.image;
  }

  if (!product.images) {
    return placeholders.productList;
  }

  // Handle object format: { image1: "url", image2: "url" }
  if (typeof product.images === 'object' && !Array.isArray(product.images)) {
    // Try the requested image key first
    const imageUrl = product.images[imageKey];
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      return imageUrl;
    }
    // Fallback to image1 if requested image doesn't exist
    if (imageKey !== 'image1' && product.images.image1 && typeof product.images.image1 === 'string' && product.images.image1.trim() !== '') {
      return product.images.image1;
    }
    // Try other image keys in order
    const fallbackKeys = ['image2', 'image3'];
    for (const key of fallbackKeys) {
      if (product.images[key] && typeof product.images[key] === 'string' && product.images[key].trim() !== '') {
        return product.images[key];
      }
    }
  }

  // Handle array format: [{ url: "url1" }, { url: "url2" }] or ["url1", "url2"]
  if (Array.isArray(product.images) && product.images.length > 0) {
    const imageIndex = imageKey === 'image1' ? 0 : imageKey === 'image2' ? 1 : imageKey === 'image3' ? 2 : 0;
    const image = product.images[imageIndex] || product.images[0];
    if (image) {
      // Handle both { url: "..." } and direct string
      if (typeof image === 'string' && image.trim() !== '') {
        return image;
      }
      if (typeof image === 'object' && image.url && typeof image.url === 'string' && image.url.trim() !== '') {
        return image.url;
      }
    }
    // Fallback to first available image
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim() !== '') {
        return img;
      }
      if (typeof img === 'object' && img.url && typeof img.url === 'string' && img.url.trim() !== '') {
        return img.url;
      }
    }
  }

  return placeholders.productList;
};

