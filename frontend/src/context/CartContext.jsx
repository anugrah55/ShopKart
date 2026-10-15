import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);

  // Load the cart from the backend (MongoDB is the source of truth)
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const cart = await getCart();
      setCartItems(cart);
      setAuthRequired(false);
    } catch (err) {
      setCartItems([]);
      if (err.response?.status === 401) {
        setAuthRequired(true);
      } else {
        setError("Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Each mutation returns the updated cart from the API, which replaces our state.
  // Errors are re-thrown so the component that triggered the action can show them.
  const addToCart = async (productId) => {
    const cart = await addCartItem(productId);
    setCartItems(cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const cart = await updateCartItem(productId, quantity);
    setCartItems(cart);
  };

  const removeFromCart = async (productId) => {
    const cart = await removeCartItem(productId);
    setCartItems(cart);
  };

  // Called on logout so the next user never sees the previous user's cart
  const clearCart = () => {
    setCartItems([]);
    setAuthRequired(true);
  };

  // Called after a verified payment: the backend has already emptied the cart
  const emptyCart = () => {
    setCartItems([]);
  };

  // Derived values: calculated from cartItems, never stored separately
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const getQuantityInCart = (productId) =>
    cartItems.find((item) => item.product._id === productId)?.quantity || 0;

  const value = {
    cartItems,
    loading,
    error,
    authRequired,
    cartCount,
    subtotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    emptyCart,
    getQuantityInCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
