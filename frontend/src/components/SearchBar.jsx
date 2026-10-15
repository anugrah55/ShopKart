import React from "react";

const CATEGORIES = ["Dogs", "Cats"];

function SearchBar({ search, category, sort, onSearchChange, onCategoryChange, onSortChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search pets by name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">All Pets</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}

export default SearchBar;
