import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";
import { loadRazorpayScript } from "../services/razorpay";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: ""
};

// Same rules as the backend. Returns { fieldName: message } for every invalid field.
const validateAddress = (address) => {
  const errors = {};

  Object.keys(EMPTY_ADDRESS).forEach((field) => {
    if (address[field].trim() === "") {
      errors[field] = "This field is required.";
    }
  });

  if (!errors.phone && !/^[6-9]\d{9}$/.test(address.phone.trim())) {
    errors.phone = "Phone must be a valid 10-digit mobile number.";
  }

  if (!errors.pincode && !/^\d{6}$/.test(address.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

function Checkout() {
  const { cartItems, loading, authRequired, subtotal, emptyCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [statusText, setStatusText] = useState("");

  if (authRequired) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const handlePlaceOrder = async () => {
    if (placing) return;
    setFormError("");

    // Don't call the backend if basic validation fails
    const errors = validateAddress(address);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    const shippingAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()])
    );

    setPlacing(true);
    setStatusText("Creating your order...");

    // Step 1: backend validates cart + stock, calculates the total and creates the Razorpay order
    let data;
    try {
      data = await createPaymentOrder(shippingAddress);
    } catch (err) {
      setFormError(err.response?.data?.message || "Unable to place order. Please try again.");
      setPlacing(false);
      // Stock or products may have changed, so show the latest cart
      if (err.response?.status === 400) refreshCart();
      return;
    }

    // Step 2: load Razorpay Checkout
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setFormError("Unable to load the payment gateway. Check your internet connection and try again.");
      setPlacing(false);
      return;
    }

    setStatusText("Waiting for payment...");

    // Step 3: open Razorpay Checkout with the order the backend created
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: data.razorpayOrderId,

      // Razorpay calling this does NOT mean the payment is trusted: the backend must verify the signature
      handler: async (response) => {
        setStatusText("Verifying payment...");
        try {
          const order = await verifyPayment({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          // Backend has cleared the cart; mirror that in global state so the Navbar shows Cart (0)
          navigate(`/order-success/${order._id}`, { replace: true });
          emptyCart();
        } catch (err) {
          setFormError(
            err.response?.data?.message
              ? `${err.response.data.message}. Your cart has not been cleared.`
              : "Payment verification failed. Your cart has not been cleared."
          );
          setPlacing(false);
        }
      },

      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone
      },

      theme: { color: "#0066cc" },

      modal: {
        ondismiss: () => {
          setPlacing(false);
          setFormError((prev) => prev || "Payment was cancelled. Your cart has not been cleared.");
        }
      }
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on("payment.failed", (response) => {
      console.error("Payment failed", response.error);
      setFormError("Payment failed. Your cart has not been cleared. Please try again.");
    });

    paymentObject.open();
  };

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading checkout...</p>;
    }

    // Opening /checkout directly with an empty cart
    if (cartItems.length === 0) {
      return (
        <div className="state-box">
          <div className="state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products before checking out.</p>
          <Link to="/products" className="btn-primary state-link">
            Browse Pets
          </Link>
        </div>
      );
    }

    const summaryItems = cartItems.map((item) => ({
      id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    return (
      <div className="cart-layout">
        <CheckoutForm values={address} errors={fieldErrors} onChange={handleChange} disabled={placing} />

        <OrderSummary items={summaryItems} total={subtotal}>
          {formError && <div className="error-message">{formError}</div>}
          <button className="btn-primary" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? statusText : `Pay ₹${subtotal.toLocaleString("en-IN")} with Razorpay`}
          </button>
          <p className="checkout-note">Test Mode — no real money is charged.</p>
        </OrderSummary>
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <Link to="/cart" className="back-link">
          ← Back to Cart
        </Link>
        <h2>Checkout</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default Checkout;
