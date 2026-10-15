import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusTracker, { STATUS_STEPS } from "../components/StatusTracker";
import { formatDate } from "../components/OrderCard";
import { getOrderById, updateOrderStatus } from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    setLoading(true);
    getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.response?.data?.message || "Unable to load this order."))
      .finally(() => setLoading(false));
  }, [id]);

  // Bonus: dev-only button to move the order to its next status
  const nextStatus = order && STATUS_STEPS[STATUS_STEPS.indexOf(order.status) + 1];

  const handleAdvanceStatus = async () => {
    setUpdating(true);
    setStatusError("");
    try {
      setOrder(await updateOrderStatus(order._id, nextStatus));
    } catch (err) {
      setStatusError(err.response?.data?.message || "Unable to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading order...</p>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }

    const { shippingAddress } = order;

    return (
      <div className="order-card">
        <div className="order-card-header">
          <div>
            <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
            <p className="product-category">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className="status-badge">{order.status}</span>
        </div>

        <StatusTracker status={order.status} />

        {/* Items show the price saved at purchase time, not the current product price */}
        <div className="order-detail-items">
          {order.items.map((item) => (
            <div className="order-detail-item" key={item._id}>
              {item.image && <img src={item.image} alt={item.name} />}
              <div className="cart-item-info">
                <Link to={`/products/${item.product}`} className="cart-item-name">
                  {item.name}
                </Link>
                <p className="product-category">
                  ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                </p>
              </div>
              <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
            </div>
          ))}
        </div>

        <div className="order-detail-grid">
          <div>
            <h4>Shipping Address</h4>
            <p>{shippingAddress.fullName}</p>
            <p>{shippingAddress.addressLine1}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
            </p>
            <p>Phone: {shippingAddress.phone}</p>
          </div>
          <div>
            <h4>Payment</h4>
            <p>Status: {order.paymentStatus}</p>
            {order.razorpayPaymentId && <p>Payment ID: {order.razorpayPaymentId}</p>}
            <p className="order-total">Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {order.paymentStatus === "PAID" && nextStatus && (
          <div className="dev-panel">
            <span>Dev tool:</span>
            <button className="btn-wishlist" onClick={handleAdvanceStatus} disabled={updating}>
              {updating ? "Updating..." : `Mark as ${nextStatus}`}
            </button>
            {statusError && <p className="wishlist-error">{statusError}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <Link to="/orders" className="back-link">
          ← Back to My Orders
        </Link>
        {renderContent()}
      </div>
    </div>
  );
}

export default OrderDetails;
