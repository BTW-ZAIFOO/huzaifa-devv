import React, { useState, useEffect, useRef } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(() => {
        onSearch(query);
      }, 500);
    } else {
      onSearch("");
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, onSearch]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <i className="fas fa-search text-gray-400"></i>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search posts, users..."
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
