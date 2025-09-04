import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Search, Clock, X, TrendingUp } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

const EnhancedSearch = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchRef = useRef();

  // Popular search suggestions
  const popularSearches = [
    "Frontend Developer",
    "Backend Developer", 
    "Full Stack Developer",
    "Data Scientist",
    "UI/UX Designer",
    "Product Manager",
    "Marketing Manager",
    "Software Engineer"
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = popularSearches.filter(search =>
        search.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Handle search
  const searchJobHandler = (searchQuery = query) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      
      dispatch(setSearchedQuery(searchQuery));
      navigate("/browse");
      setIsOpen(false);
      setQuery("");
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto" ref={searchRef}>
      <div className="flex shadow-lg border border-gray-200 dark:border-gray-700 pl-3 rounded-full items-center gap-4 bg-white dark:bg-gray-800">
        <input
          type="text"
          placeholder="Find your dream jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyPress={(e) => e.key === 'Enter' && searchJobHandler()}
          className="outline-none border-none w-full bg-transparent text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 py-3"
        />
        <Button
          className="rounded-r-full bg-[#6a38c2] hover:bg-[#5b30a6] min-w-[48px] h-12"
          onClick={() => searchJobHandler()}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          
          {/* Suggestions based on query */}
          {suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</h4>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => searchJobHandler(suggestion)}
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Searches</h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => searchJobHandler(search)}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{search}</span>
                </div>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {query === "" && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular Searches
              </h4>
              {popularSearches.slice(0, 4).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => searchJobHandler(search)}
                >
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{search}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;