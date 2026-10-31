import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Menu, X, LogOut, Heart, Calendar, Plus, ChevronDown } from "lucide-react";
import API from "../api/axios";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const desktopLink = ({ isActive }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
    isActive
      ? "bg-rose-50 text-rose-600"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  }`;

const mobileLink = ({ isActive }) =>
  `flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
    isActive ? "bg-rose-50 text-rose-600" : "text-gray-700 hover:bg-gray-50"
  }`;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  useEffect(() => {
    setSearchTerm(searchParams.get("query") || "");
  }, [searchParams]);

  // Shadow appears only after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user dropdown on outside click / Escape
  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setIsUserMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const user = getStoredUser();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
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
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b transition-shadow duration-200 ${
        scrolled ? "border-gray-200 shadow-sm" : "border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-5">
        {/* LOGO */}
        <Link to="/" className="flex items-center shrink-0" aria-label="StayNest home">
          <img
            src="/logo.png"
            alt="StayNest Logo"
            className="h-10 sm:h-12 w-auto object-contain max-w-[160px] sm:max-w-[200px]"
          />
        </Link>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="flex-1 max-w-[520px] min-w-0"
        >
          <div className="flex items-center w-full h-11 sm:h-12 bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
            <input
              type="text"
              placeholder="Search destinations, title, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search listings"
              className="flex-1 min-w-0 h-full pl-4 sm:pl-5 pr-2 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="shrink-0 p-1.5 mr-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center shrink-0 h-9 w-9 sm:h-10 sm:w-10 mr-1 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </form>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1 shrink-0" aria-label="Primary">
          <NavLink to="/listings/new" className={desktopLink}>
            <Plus className="w-4 h-4" />
            <span>Add listing</span>
          </NavLink>

          <NavLink to="/wishlist" className={desktopLink}>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Wishlist</span>
          </NavLink>

          {user && (
            <NavLink to="/my-bookings" className={desktopLink}>
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>My Bookings</span>
            </NavLink>
          )}

          {user ? (
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-gray-300 bg-white hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-sm font-semibold">
                  {initial}
                </span>
                <span className="text-sm font-semibold text-gray-900 max-w-[90px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 origin-top-right"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-full text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* MOBILE BUTTON */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg">
          {user && (
            <div className="flex items-center gap-3 px-3 pb-3 mb-2 border-b border-gray-100">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 text-white font-semibold">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              </div>
            </div>
          )}

          <NavLink to="/listings/new" onClick={() => setIsMobileMenuOpen(false)} className={mobileLink}>
            <Plus className="w-4 h-4" />
            <span>Add new listing</span>
          </NavLink>

          <NavLink to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className={mobileLink}>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Wishlist</span>
          </NavLink>

          {user && (
            <NavLink to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)} className={mobileLink}>
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>My Bookings</span>
            </NavLink>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;