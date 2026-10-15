import React from "react";
import { Link } from "react-router-dom";
import StatusTracker from "./StatusTracker";

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function OrderCard({ order }) {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
          <p className="product-category">{formatDate(order.createdAt)}</p>
        </div>
        <span className="status-badge">{order.status}</span>
      </div>

      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item._id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <StatusTracker status={order.status} />

      <div className="order-card-footer">
        <strong>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</strong>
        <Link to={`/orders/${order._id}`} className="btn-primary order-link">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default OrderCard;
