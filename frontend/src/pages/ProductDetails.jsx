import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, getQuantityInCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    setCartMessage("");
    setCartError("");
    try {
      await addToCart(id);
      setCartMessage("🛒 Added to Cart");
    } catch (err) {
      setCartError(
        err.response?.status === 401
          ? "Please log in to add products to your cart."
          : err.response?.data?.message || "Unable to add to cart. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Something went wrong while loading the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading product...</p>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }

    const inCart = getQuantityInCart(product._id);
    const maxReached = inCart >= product.stock;

    return (
      <div className="details-card">
        <img src={product.image} alt={product.name} className="details-image" />

        <div className="details-info">
          <p className="product-category">{product.category}</p>
          <h2>{product.name}</h2>
          <p className="details-price">₹{product.price.toLocaleString("en-IN")}</p>
          <p className="details-description">{product.description}</p>
          <p className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
            {product.stock > 0 ? `In stock: ${product.stock} units` : "Out of stock"}
          </p>

          <button className="btn-primary" onClick={handleAddToCart} disabled={adding || maxReached}>
            {adding
              ? "Adding..."
              : product.stock === 0
                ? "Out of Stock"
                : maxReached
                  ? "Max Quantity in Cart"
                  : inCart > 0
                    ? `Add Another (${inCart} in cart)`
                    : "Add to Cart"}
          </button>
          {cartMessage && (
            <p className="wishlist-message">
              {cartMessage} — <Link to="/cart">View Cart</Link>
            </p>
          )}
          {cartError && <p className="wishlist-error">{cartError}</p>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <Link to="/products" className="back-link">
          ← Back to Products
        </Link>
        {renderContent()}
      </div>
    </div>
  );
}

export default ProductDetails;
