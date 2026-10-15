import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart } = useCart();
  // Loading state for this one item only, so other items stay usable
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const runAction = async (action) => {
    if (updating) return;
    setUpdating(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // If stock dropped below the cart quantity, "-" brings it straight down to what is available
  const overStock = quantity > product.stock;
  const decreaseTo = overStock ? Math.max(product.stock, 1) : quantity - 1;

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} className="cart-item-image" />

      <div className="cart-item-info">
        <Link to={`/products/${product._id}`} className="cart-item-name">
          {product.name}
        </Link>
        <p className="product-category">{product.category}</p>
        <p className="cart-item-price">₹{product.price.toLocaleString("en-IN")}</p>
        {overStock && (
          <p className="wishlist-error">
            {product.stock === 0 ? "Out of stock. Please remove this item." : `Only ${product.stock} left in stock.`}
          </p>
        )}

        <div className="cart-item-controls">
          <div className="qty-control">
            <button
              onClick={() => runAction(() => updateQuantity(product._id, decreaseTo))}
              disabled={updating || quantity <= 1 || (overStock && product.stock === 0)}
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => runAction(() => updateQuantity(product._id, quantity + 1))}
              disabled={updating || quantity >= product.stock}
            >
              +
            </button>
          </div>

          <button
            className="remove-btn"
            onClick={() => runAction(() => removeFromCart(product._id))}
            disabled={updating}
          >
            {updating ? "Updating..." : "Remove"}
          </button>
        </div>

        {error && <p className="wishlist-error">{error}</p>}
      </div>

      <div className="cart-item-total">₹{(product.price * quantity).toLocaleString("en-IN")}</div>
    </div>
  );
}

export default CartItem;
