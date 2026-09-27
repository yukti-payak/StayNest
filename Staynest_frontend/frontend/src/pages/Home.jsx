import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { 
  Flame, Bed, Building2, Mountain, Castle, 
  Waves, Tent, Tractor, Snowflake 
} from "lucide-react";

const categories = [
  { name: "Trending", icon: Flame },
  { name: "Rooms", icon: Bed },
  { name: "Iconic Cities", icon: Building2 },
  { name: "Mountains", icon: Mountain },
  { name: "Castles", icon: Castle },
  { name: "Amazing Pools", icon: Waves },
  { name: "Camping", icon: Tent },
  { name: "Farms", icon: Tractor },
  { name: "Arctic", icon: Snowflake },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentCategory = searchParams.get("category") || "";
  const currentQuery = searchParams.get("query") || "";

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (currentCategory) queryParams.append("category", currentCategory);
        if (currentQuery) queryParams.append("query", currentQuery);

        const res = await API.get(`/listings?${queryParams.toString()}`);
        setListings(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch listings. Make sure your backend server is running on port 8080.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentCategory, currentQuery]);

  const handleCategoryClick = (categoryName) => {
    const newParams = new URLSearchParams(searchParams);
    if (currentCategory === categoryName) {
      newParams.delete("category");
    } else {
      newParams.set("category", categoryName);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filter Bar */}
        <div className="flex items-center gap-8 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-gray-200">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex flex-col items-center gap-1 min-w-fit pb-2 transition border-b-2 cursor-pointer ${
                  isActive
                    ? "border-black text-black font-semibold"
                    : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                }`}
              >
                <Icon size={22} />
                <span className="text-xs">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Search / Filter Badge */}
        {(currentQuery || currentCategory) && (
          <div className="flex items-center justify-between mb-6 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm">
              Showing results for:{" "}
              {currentQuery && <span className="font-bold text-gray-900">"{currentQuery}" </span>}
              {currentCategory && <span className="font-bold text-gray-900">in {currentCategory}</span>}
            </p>
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 text-gray-500 font-medium">
            Loading listings...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-bold text-gray-800">No listings found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search query or category filter.
            </p>
          </div>
        )}

        {/* Grid Display */}
        {!loading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;