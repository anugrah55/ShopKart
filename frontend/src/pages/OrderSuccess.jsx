import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.response?.data?.message || "Unable to load your order."))
      .finally(() => setLoading(false));
  }, [id]);

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading your order...</p>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }

    return (
      <div className="state-box">
        <div className="state-icon">✅</div>
        <h2>Order Placed Successfully</h2>
        <div className="success-details">
          <div className="summary-row">
            <span>Order ID</span>
            <span>{order._id}</span>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Payment</span>
            <span>{order.paymentStatus}</span>
          </div>
          <div className="summary-row">
            <span>Status</span>
            <span>{order.status}</span>
          </div>
        </div>
        <p>Your order has been saved successfully.</p>
        <div className="success-actions">
          <Link to="/orders" className="btn-primary state-link">
            View My Orders
          </Link>
          <Link to="/products" className="btn-wishlist state-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">{renderContent()}</div>
    </div>
  );
}

export default OrderSuccess;
