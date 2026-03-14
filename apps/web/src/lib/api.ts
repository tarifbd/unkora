import axios, { type AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── PRODUCTS ─────────────────────────────────

export const productsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get("/products", { params }).then((r) => r.data),
  getBySlug: (slug: string) =>
    api.get(`/products/${slug}`).then((r) => r.data),
  getFeatured: () =>
    api.get("/products/featured").then((r) => r.data),
  getFlashSale: () =>
    api.get("/products/flash-sale").then((r) => r.data),
  getRelated: (id: string) =>
    api.get(`/products/${id}/related`).then((r) => r.data),
};

// ── CATEGORIES ────────────────────────────────

export const categoriesApi = {
  getTree: () => api.get("/categories/tree").then((r) => r.data),
  getBySlug: (slug: string) =>
    api.get(`/categories/${slug}`).then((r) => r.data),
};

// ── SEARCH ────────────────────────────────────

export const searchApi = {
  search: (params: { q: string; page?: number; per_page?: number; [key: string]: unknown }) =>
    api.get("/search", { params }).then((r) => r.data),
  autocomplete: (q: string) =>
    api.get("/search/autocomplete", { params: { q } }).then((r) => r.data),
};

// ── CART ─────────────────────────────────────

export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data),
  addItem: (data: { product_id: string; variant_id?: string; quantity: number }) =>
    api.post("/cart/items", data).then((r) => r.data),
  updateItem: (itemId: string, quantity: number) =>
    api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId: string) =>
    api.delete(`/cart/items/${itemId}`).then((r) => r.data),
  applyCoupon: (code: string) =>
    api.post("/cart/coupon", { code }).then((r) => r.data),
  removeCoupon: () => api.delete("/cart/coupon").then((r) => r.data),
};

// ── ORDERS ────────────────────────────────────

export const ordersApi = {
  checkout: (data: {
    payment_method: string;
    shipping_address_id: string;
    delivery_method?: string;
    coupon_code?: string;
    notes?: string;
  }) => api.post("/orders/checkout", data).then((r) => r.data),
  list: (params?: { page?: number; per_page?: number }) =>
    api.get("/orders", { params }).then((r) => r.data),
  getByNumber: (orderNumber: string) =>
    api.get(`/orders/${orderNumber}`).then((r) => r.data),
  cancel: (id: string, reason: string) =>
    api.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
};

// ── PAYMENTS ──────────────────────────────────

export const paymentsApi = {
  initiate: (orderId: string, gateway: string) =>
    api.post("/payments/initiate", { order_id: orderId, gateway }).then((r) => r.data),
  verify: (transactionId: string) =>
    api.get(`/payments/verify/${transactionId}`).then((r) => r.data),
};

// ── AUTH ─────────────────────────────────────

export const authApi = {
  sendOtp: (phone: string) =>
    api.post("/auth/login/phone", { phone }).then((r) => r.data),
  verifyOtp: (data: { phone: string; otp: string; device_fingerprint: string }) =>
    api.post("/auth/login/phone/verify", data).then((r) => r.data),
  loginEmail: (data: { email: string; password: string; device_fingerprint: string }) =>
    api.post("/auth/login/email", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  updateMe: (data: { name_en?: string; name_bn?: string; avatar?: string }) =>
    api.patch("/auth/me", data).then((r) => r.data),
};

// ── REVIEWS ───────────────────────────────────

export const reviewsApi = {
  create: (data: { product_id: string; order_id: string; rating: number; body: string; title?: string }) =>
    api.post("/reviews", data).then((r) => r.data),
  getByProduct: (productId: string, params?: { page?: number }) =>
    api.get(`/reviews/product/${productId}`, { params }).then((r) => r.data),
};

// ── WISHLIST ──────────────────────────────────

export const wishlistApi = {
  get: () => api.get("/wishlist").then((r) => r.data),
  toggle: (productId: string) =>
    api.post("/wishlist/toggle", { product_id: productId }).then((r) => r.data),
};

// ── DELIVERY ESTIMATION ───────────────────────

export const deliveryApi = {
  estimate: (params: { district: string; weight_grams?: number }) =>
    api.get("/delivery/estimate", { params }).then((r) => r.data),
};
