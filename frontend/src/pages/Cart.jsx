import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, loading, error, authRequired, cartCount, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();

  if (authRequired) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading your cart...</p>;
    }

    if (error) {
      return (
        <div className="state-box">
          <h3>{error}</h3>
          <button className="btn-primary" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="state-box">
          <div className="state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-primary state-link">
            Browse Pets
          </Link>
        </div>
      );
    }

    return (
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h2>My Cart</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default Cart;
