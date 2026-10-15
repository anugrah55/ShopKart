import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true
});

// Only send query params that actually have a value
export const getProducts = async ({ search, category, sort } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const response = await api.get("/products", { params });
  return response.data.products;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.product;
};

// Tell the Navbar to refresh its wishlist count after any change
const notifyWishlistChanged = () => window.dispatchEvent(new Event("wishlist:changed"));

export const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data.wishlist;
};

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  notifyWishlistChanged();
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  notifyWishlistChanged();
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  notifyWishlistChanged();
  return response.data.saved;
};

// Every cart API returns the full updated cart, so the UI can replace its state with it
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data.cart;
};

export const addCartItem = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data.cart;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data.cart;
};

export const removeCartItem = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data.cart;
};

// Orders + payments: only the shipping address is sent; the server calculates the total
export const createPaymentOrder = async (shippingAddress) => {
  const response = await api.post("/orders/create-payment-order", { shippingAddress });
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await api.post("/orders/verify-payment", payload);
  return response.data.order;
};

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data.orders;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data.order;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data.order;
};

export default api;
