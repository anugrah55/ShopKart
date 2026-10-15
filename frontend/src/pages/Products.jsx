import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { getProducts, getWishlist } from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);

  // Load saved product ids once so each card knows whether it is already wishlisted
  useEffect(() => {
    getWishlist()
      .then((items) => setWishlistIds(items.map((item) => item._id)))
      .catch(() => setWishlistIds([]));
  }, []);

  useEffect(() => {
    // Wait for the user to stop typing before calling the API
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProducts({ search, category, sort });
        setProducts(data);
      } catch (err) {
        console.log(err);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, category, sort]);

  const handleWishlistChange = (productId, saved) => {
    setWishlistIds((prev) =>
      saved ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Loading products...</p>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (products.length === 0) {
      return <p className="status-message">No products found.</p>;
    }
    return (
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            saved={wishlistIds.includes(product._id)}
            onWishlistChange={handleWishlistChange}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <p className="page-kicker">● {products.length || "–"} pets looking for a home</p>
        <h2>Find your new<br /><em>best friend.</em></h2>
        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
        {renderContent()}
      </div>
    </div>
  );
}

export default Products;
