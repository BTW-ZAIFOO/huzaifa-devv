import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim()) {
      timeoutRef.current = setTimeout(async () => {
        onSearch(query);
        try {
          const res = await axios.get(
            `http://localhost:4000/api/v1/search/all?q=${encodeURIComponent(
              query
            )}`,
            { withCredentials: true }
          );
          setResults({
            users: res.data.users || [],
            posts: res.data.posts || [],
          });
          setShowDropdown(true);
        } catch {
          setResults({ users: [], posts: [] });
          setShowDropdown(false);
        }
      }, 500);
    } else {
      onSearch("");
      setResults({ users: [], posts: [] });
      setShowDropdown(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, onSearch]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleResultClick = (type, id) => {
    setShowDropdown(false);
    setQuery("");
    if (type === "user") {
      navigate(`/profile/${id}`);
    } else if (type === "post") {
      navigate(`/feed?post=${id}`);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <i className="fas fa-search text-gray-400"></i>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search posts, users..."
        autoComplete="off"
        onFocus={() => query && setShowDropdown(true)}
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            setShowDropdown(false);
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
        </button>
      )}
      {showDropdown &&
        (results.users.length > 0 || results.posts.length > 0) && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {results.users.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
                  Users
                </div>
                {results.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleResultClick("user", user._id)}
                  >
                    <img
                      src={user.avatar || "https://via.placeholder.com/32"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-800">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.posts.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs text-gray-500 font-semibold">
                  Posts
                </div>
                {results.posts.map((post) => (
                  <div
                    key={post._id}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleResultClick("post", post._id)}
                  >
                    <div className="font-medium text-gray-800 truncate">
                      {post.content?.slice(0, 80) || "Untitled Post"}
                    </div>
                    <div className="text-xs text-gray-500">
                      by {post.author?.name || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.users.length === 0 && results.posts.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-center">
                No results found
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default SearchBar;
