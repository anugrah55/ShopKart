import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import { getOrders } from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setOrders(await getOrders());
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading your orders...</p>;
    }

    if (error) {
      return (
        <div className="state-box">
          <h3>Unable to load your orders.</h3>
          <button className="btn-primary" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="state-box">
          <div className="state-icon">📦</div>
          <h3>You have not placed any orders yet.</h3>
          <Link to="/products" className="btn-primary state-link">
            Start Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h2>My Orders</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default Orders;
