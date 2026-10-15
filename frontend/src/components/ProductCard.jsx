import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleWishlist } from "../services/api";
import { useCart } from "../context/CartContext";
import useTilt from "./useTilt";

function ProductCard({ product, saved, onWishlistChange }) {
  const navigate = useNavigate();
  const tilt = useTilt();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { addToCart, getQuantityInCart } = useCart();
  const [adding, setAdding] = useState(false);

  const inCart = getQuantityInCart(product._id);
  const maxReached = inCart >= product.stock;

  const handleAddToCart = async () => {
    if (adding) return;

    setAdding(true);
    setMessage("");
    setError("");
    try {
      await addToCart(product._id);
      setMessage("🛒 Added to Cart");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to add products to your cart.");
      } else {
        setError(err.response?.data?.message || "Unable to add to cart. Please try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  const cartLabel = adding
    ? "Adding..."
    : product.stock === 0
      ? "Already Adopted"
      : maxReached
        ? "Max Quantity in Cart"
        : inCart > 0
          ? `Add Another (${inCart} in cart)`
          : "Add to Cart";

  const handleWishlist = async () => {
    // Ignore extra clicks while a request is already running
    if (saving) return;

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const isSaved = await toggleWishlist(product._id);
      onWishlistChange(product._id, isSaved);
      setMessage(isSaved ? "♥ Added to Wishlist" : "Removed from Wishlist");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to save products.");
      } else {
        setError("Unable to save product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const wishlistLabel = saving ? "⏳ Saving..." : saved ? "♥ Remove from Wishlist" : "♡ Add to Wishlist";

  return (
    <div className="product-card" {...tilt}>
      <img src={product.image} alt={product.name} className="product-image" />

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>
        <p className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
          {product.stock > 0 ? `${product.stock} available` : "Already adopted"}
        </p>

        <div className="card-actions">
          <button className="btn-primary" onClick={() => navigate(`/products/${product._id}`)}>
            View Details
          </button>
          <button className="btn-cart" onClick={handleAddToCart} disabled={adding || maxReached}>
            {cartLabel}
          </button>
          <button
            className={saved ? "btn-wishlist saved" : "btn-wishlist"}
            onClick={handleWishlist}
            disabled={saving}
          >
            {wishlistLabel}
          </button>
        </div>

        {message && <p className="wishlist-message">{message}</p>}
        {error && <p className="wishlist-error">{error}</p>}
      </div>
    </div>
  );
}

export default ProductCard;
