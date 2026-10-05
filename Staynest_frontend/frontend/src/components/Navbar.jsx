import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Menu, X, LogOut, Heart } from "lucide-react";
import API from "../api/axios";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("query") || ""
  );

  useEffect(() => {
    setSearchTerm(searchParams.get("query") || "");
  }, [searchParams]);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const queryParams = new URLSearchParams(searchParams);

    if (searchTerm.trim()) {
      queryParams.set("query", searchTerm.trim());
    } else {
      queryParams.delete("query");
    }

    navigate(`/?${queryParams.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-5">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="flex items-center shrink-0 cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="StayNest Logo"
            className="h-11 sm:h-14 w-auto object-contain max-w-[170px] sm:max-w-[210px]"
          />
        </Link>

        {/* ================= SEARCH BAR ================= */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-[500px] mx-1 sm:mx-3"
        >
          <div
            className="
              flex items-center
              w-full
              h-11 sm:h-12
              bg-white
              border border-gray-300
              rounded-full
              shadow-sm
              overflow-hidden
              transition-all duration-200
              focus-within:border-gray-400
              focus-within:shadow-md
              hover:shadow-md
            "
          >
            {/* Input */}
            <input
              type="text"
              placeholder="Search destinations, title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                flex-1
                min-w-0
                h-full
                px-4 sm:px-5
                text-sm
                text-gray-700
                placeholder-gray-400
                bg-transparent
                outline-none
              "
            />

            {/* Search Button */}
            <button
              type="submit"
              aria-label="Search"
              className="
                flex
                items-center
                justify-center
                shrink-0
                h-9 w-9
                sm:h-10 sm:w-10
                mr-1
                rounded-full
                bg-rose-500
                hover:bg-rose-600
                active:bg-rose-700
                text-white
                transition-all duration-200
                cursor-pointer
                shadow-sm
              "
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </form>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <div className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-gray-700 shrink-0">

          {/* Add Listing */}
          <Link
            to="/listings/new"
            className="hover:text-rose-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            Add new listing
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="
              flex items-center gap-1.5
              hover:text-rose-500
              transition-colors
              cursor-pointer
              whitespace-nowrap
            "
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Wishlist</span>
          </Link>

          {/* User */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-semibold whitespace-nowrap">
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-1.5
                  bg-rose-500
                  hover:bg-rose-600
                  text-white
                  px-3.5 py-2
                  rounded-lg
                  transition-colors
                  text-sm
                  cursor-pointer
                  whitespace-nowrap
                "
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/signup"
                className="hover:text-rose-500 transition-colors cursor-pointer"
              >
                Sign Up
              </Link>

              <Link
                to="/login"
                className="hover:text-rose-500 transition-colors cursor-pointer"
              >
                Log in
              </Link>
            </>
          )}
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
              p-2
              text-gray-600
              hover:text-gray-900
              focus:outline-none
              cursor-pointer
            "
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isMobileMenuOpen && (
        <div
          className="
            md:hidden
            border-t border-gray-100
            bg-white
            px-4
            pt-2
            pb-4
            space-y-3
            shadow-lg
          "
        >
          <Link
            to="/listings/new"
            onClick={() => setIsMobileMenuOpen(false)}
            className="
              block w-full
              text-left
              py-2
              text-sm
              font-medium
              text-gray-700
              hover:text-rose-500
              transition
            "
          >
            Add new listing
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="
              flex items-center gap-2
              w-full
              text-left
              py-2
              text-sm
              font-medium
              text-gray-700
              hover:text-rose-500
              transition
            "
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Wishlist</span>
          </Link>

          {user ? (
            <>
              <div className="py-1 text-sm font-semibold text-gray-900">
                Hi, {user.name}
              </div>

              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-2
                  w-full
                  text-left
                  py-2
                  text-sm
                  font-medium
                  text-rose-500
                  hover:text-rose-600
                  transition
                  cursor-pointer
                "
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
                className="
                  block w-full
                  text-left
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  hover:text-rose-500
                  transition
                "
              >
                Sign Up
              </Link>

              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  block w-full
                  text-left
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  hover:text-rose-500
                  transition
                "
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