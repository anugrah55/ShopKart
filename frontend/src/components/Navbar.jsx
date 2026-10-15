import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(null);
  // Cart count comes from the shared cart state, not a separate fetch
  const { cartCount, clearCart } = useCart();

  // Count comes from the backend; refetch whenever the wishlist changes anywhere in the app
  useEffect(() => {
    const loadCount = () => {
      getWishlist()
        .then((items) => setWishlistCount(items.length))
        .catch(() => setWishlistCount(null));
    };

    loadCount();
    window.addEventListener("wishlist:changed", loadCount);
    return () => window.removeEventListener("wishlist:changed", loadCount);
  }, []);

  const handleLogout = async () => {
    clearCart();
    try {
      await api.post("/customers/logout");
      navigate("/login");
    } catch (err) {
      console.log(err);
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">ShopKart</div>
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/products">Pets</Link>
        <Link to="/wishlist">
          Wishlist{wishlistCount !== null ? ` (${wishlistCount})` : ""}
        </Link>
        <Link to="/cart">Cart ({cartCount})</Link>
        <Link to="/orders">Orders</Link>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
