import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist } from "../services/api";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (err) {
      console.log(err);
      // Not logged in -> send the user to login instead of showing an error
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
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoved = (productId) => {
    setWishlist((prev) => prev.filter((product) => product._id !== productId));
  };

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading your wishlist...</p>;
    }

    if (error) {
      return (
        <div className="state-box">
          <h3>Something went wrong.</h3>
          <p>We couldn't load your wishlist.</p>
          <button className="btn-primary" onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      );
    }

    if (wishlist.length === 0) {
      return (
        <div className="state-box">
          <div className="state-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn-primary state-link">
            Browse Pets
          </Link>
        </div>
      );
    }

    return (
      <>
        <p className="wishlist-count">
          {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
        </p>
        <div className="product-grid">
          {wishlist.map((product) => (
            <WishlistCard key={product._id} product={product} onRemoved={handleRemoved} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h2>My Wishlist</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default Wishlist;
