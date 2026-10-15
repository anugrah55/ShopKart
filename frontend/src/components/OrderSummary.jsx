import React from "react";

// Shows "name × qty  ₹line total" for each item plus the total. Used by Checkout.
function OrderSummary({ items, total, children }) {
  return (
    <div className="order-summary">
      <h3>Order Summary</h3>

      {items.map((item) => (
        <div className="summary-row" key={item.id}>
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
        </div>
      ))}

      <div className="summary-row summary-total">
        <span>Total</span>
        <span>₹{total.toLocaleString("en-IN")}</span>
      </div>

      {children}
    </div>
  );
}

export default OrderSummary;
