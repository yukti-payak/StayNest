import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Menu, X, LogOut } from "lucide-react";
import API from "../api/axios";

// Import your logo image if stored in src/assets
// import logoImg from "../assets/logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Initialize search term state from URL query parameter
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  // Sync state if URL search query changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get("query") || "");
  }, [searchParams]);

  // Retrieve user data from localStorage to toggle auth state
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.removeItem("user");
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 2. Handle Search Form Submit
  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(searchParams);

    if (searchTerm.trim()) {
      queryParams.set("query", searchTerm.trim());
    } else {
      queryParams.delete("query");
    }

    // Navigate to listings/home with updated query params
    navigate(`/?${queryParams.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center shrink-0 cursor-pointer">
          <img
            src="/logo.png" 
            alt="StayNest Logo" 
            className="h-12 sm:h-16 w-auto object-contain max-w-[180px] sm:max-w-[220px]"
          />
        </Link>

        {/* Center Search Bar Form */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4">
          <div className="flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition overflow-hidden bg-white">
            <input
              type="text"
              placeholder="Search destinations, title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm outline-none text-gray-700 bg-transparent placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 flex items-center gap-1.5 font-medium text-xs sm:text-sm transition shrink-0 rounded-r-full cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700 shrink-0">
          <Link to="/listings/new" className="hover:text-rose-500 transition cursor-pointer">
            Add new listing
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-900 font-semibold">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-lg transition text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/signup" className="hover:text-rose-500 transition cursor-pointer">
                Sign Up
              </Link>
              <Link to="/login" className="hover:text-rose-500 transition cursor-pointer">
                Log in
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-3 shadow-lg">
          <Link
            to="/listings/new"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-rose-500 transition"
          >
            Add new listing
          </Link>

          {user ? (
            <>
              <div className="py-1 text-sm font-semibold text-gray-900">
                Hi, {user.name}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-rose-500 transition"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left py-2 text-sm font-medium text-gray-700 hover:text-rose-500 transition"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;