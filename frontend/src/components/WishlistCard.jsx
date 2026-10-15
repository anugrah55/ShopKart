import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeFromWishlist } from "../services/api";

function WishlistCard({ product, onRemoved }) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);
    setError("");
    try {
      await removeFromWishlist(product._id);
      onRemoved(product._id);
    } catch (err) {
      console.log(err);
      setError("Unable to remove product. Please try again.");
      setRemoving(false);
    }
  };

  return (
    <div className="product-card">
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
          <button className="btn-wishlist saved" onClick={handleRemove} disabled={removing}>
            {removing ? "⏳ Removing..." : "Remove ♥"}
          </button>
        </div>

        {error && <p className="wishlist-error">{error}</p>}
      </div>
    </div>
  );
}

export default WishlistCard;
