import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { wishlistApi } from '../services/wishlistApi';
import { getProductImage, placeholders } from '../utils/imagePlaceholder';
import { fetchSareeById } from '../services/api';

const WishlistContext = createContext(null);

const hasAuthToken = () => {
  try {
    return Boolean(localStorage.getItem('auth_token'));
  } catch {
    return false;
  }
};

const normalizeProduct = (p) => {
  if (!p) return null;

  const id = p._id ? p._id.toString() : p.id ? p.id.toString() : null;
  const name = p.title || p.name || p.sourceData?.skuName || 'Untitled Product';
  const image = getProductImage(p, 'image1') || placeholders.productList;

  const mrp = typeof p.mrp === 'number' ? p.mrp : Number(p.mrp ?? 0) || 0;
  const discountPercent = typeof p.discountPercent === 'number' ? p.discountPercent : Number(p.discountPercent ?? 0) || 0;
  const computedFinalPrice = mrp > 0 ? Math.round(mrp - (mrp * discountPercent) / 100) : 0;

  return {
    id,
    name,
    image,
    price: p.price ?? p.finalPrice ?? computedFinalPrice ?? 0,
    originalPrice: p.originalPrice ?? mrp ?? 0,
    product: p,
  };
};

const getProductId = (item) => {
  if (!item) return null;
  if (typeof item === 'string' || typeof item === 'number') return item.toString();
  return item._id ? item._id.toString() : item.id ? item.id.toString() : null;
};

const isHydratedProduct = (p) => {
  if (!p || typeof p !== 'object') return false;
  const hasName = Boolean(p.title || p.name || p.sourceData?.skuName);
  const hasPricing = p.mrp != null || p.price != null || p.finalPrice != null;
  const hasImage = Boolean(p.images?.image1 || p.image || p.sourceData?.imageLink);
  return hasName && (hasPricing || hasImage);
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [toggleLoadingIds, setToggleLoadingIds] = useState([]);

  const wishlistIdSet = useMemo(
    () => new Set(wishlistItems.map((i) => i.id).filter(Boolean)),
    [wishlistItems]
  );

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlistIdSet.has(productId.toString());
    },
    [wishlistIdSet]
  );

  const isTogglingWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return toggleLoadingIds.includes(productId.toString());
    },
    [toggleLoadingIds]
  );

  const handle401 = useCallback(() => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_is_admin');
      localStorage.removeItem('user_data');
    } catch {}
    setWishlistItems([]);
    setWishlistError('Your session has expired. Please login again.');
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: false } }));
  }, []);

  const hydrateWishlistProducts = useCallback(async (rawProducts) => {
    const list = Array.isArray(rawProducts) ? rawProducts : [];
    if (list.length === 0) return [];

    const needsHydration = list.some((p) => !isHydratedProduct(p));
    if (!needsHydration) return list;

    const ids = list.map(getProductId);
    const results = await Promise.allSettled(
      ids.map((id, idx) => {
        const raw = list[idx];
        if (!id) return Promise.resolve(raw);
        if (isHydratedProduct(raw)) return Promise.resolve(raw);
        return fetchSareeById(id).catch(() => raw);
      })
    );

    return results.map((r, idx) => (r.status === 'fulfilled' ? r.value : list[idx]));
  }, []);

  const setWishlistFromApiProducts = useCallback(
    async (rawProducts) => {
      const hydrated = await hydrateWishlistProducts(rawProducts);
      setWishlistItems(hydrated.map(normalizeProduct).filter(Boolean));
    },
    [hydrateWishlistProducts]
  );

  const loadWishlist = useCallback(async () => {
    if (!hasAuthToken()) {
      setWishlistItems([]);
      setWishlistError(null);
      return;
    }

    setWishlistLoading(true);
    setWishlistError(null);
    try {
      // wishlistApi.getWishlist() returns the products array
      const products = (await wishlistApi.getWishlist()) || [];
      await setWishlistFromApiProducts(products);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        handle401();
      } else {
        setWishlistItems([]);
        setWishlistError(err?.response?.data?.message || err.message || 'Failed to load wishlist');
      }
    } finally {
      setWishlistLoading(false);
    }
  }, [handle401, setWishlistFromApiProducts]);

  useEffect(() => {
    loadWishlist();

    const onStorage = (e) => {
      if (!e || e.key === 'auth_token') loadWishlist();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadWishlist]);

  const addToWishlist = useCallback(
    async (productOrId) => {
      const productId = typeof productOrId === 'object' ? productOrId?._id || productOrId?.id : productOrId;
      if (!productId) return;
      if (isInWishlist(productId)) return;

      const pid = productId.toString();
      const optimistic = normalizeProduct(typeof productOrId === 'object' ? productOrId : { _id: pid });
      const prevSnapshot = wishlistItems;

      setToggleLoadingIds((ids) => Array.from(new Set([...ids, pid])));
      setWishlistError(null);
      if (optimistic) setWishlistItems((prev) => [...prev, optimistic]);

      try {
        const data = await wishlistApi.addToWishlist(pid);
        const products = data?.products || [];
        await setWishlistFromApiProducts(products);
      } catch (err) {
        const status = err?.response?.status;
        setWishlistItems(prevSnapshot);
        if (status === 401) handle401();
        else setWishlistError(err?.response?.data?.message || err.message || 'Failed to add to wishlist');
        throw err;
      } finally {
        setToggleLoadingIds((ids) => ids.filter((id) => id !== pid));
      }
    },
    [handle401, isInWishlist, setWishlistFromApiProducts, wishlistItems]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return;
      if (!isInWishlist(productId)) return;

      const pid = productId.toString();
      const prevSnapshot = wishlistItems;

      setToggleLoadingIds((ids) => Array.from(new Set([...ids, pid])));
      setWishlistError(null);
      setWishlistItems((prev) => prev.filter((i) => i.id?.toString() !== pid));

      try {
        const data = await wishlistApi.removeFromWishlist(pid);
        const products = data?.products || [];
        await setWishlistFromApiProducts(products);
      } catch (err) {
        const status = err?.response?.status;
        setWishlistItems(prevSnapshot);
        if (status === 401) handle401();
        else setWishlistError(err?.response?.data?.message || err.message || 'Failed to remove from wishlist');
        throw err;
      } finally {
        setToggleLoadingIds((ids) => ids.filter((id) => id !== pid));
      }
    },
    [handle401, isInWishlist, setWishlistFromApiProducts, wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (productOrId) => {
      const productId = typeof productOrId === 'object' ? productOrId?._id || productOrId?.id : productOrId;
      if (!productId) return;
      if (isInWishlist(productId)) return removeFromWishlist(productId);
      return addToWishlist(productOrId);
    },
    [addToWishlist, isInWishlist, removeFromWishlist]
  );

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      wishlistLoading,
      wishlistError,
      isInWishlist,
      isTogglingWishlist,
      loadWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }),
    [
      wishlistItems,
      wishlistLoading,
      wishlistError,
      isInWishlist,
      isTogglingWishlist,
      loadWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};

