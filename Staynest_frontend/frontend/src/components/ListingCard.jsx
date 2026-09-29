import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import API from "../api/axios";

const ListingCard = ({ listing, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigating to single listing detail page
    e.stopPropagation();

    const currentUser = localStorage.getItem("user");
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/wishlist/toggle", { listingId: listing._id });
      if (res.data.success) {
        setIsWishlisted((prev) => !prev);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/listings/${listing._id}`} className="block group">
      <div className="cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition duration-300">
        
        {/* Image & Heart Button Overlay */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={listing.image?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          {/* Heart Wishlist Icon */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={loading}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white hover:scale-110 active:scale-95 text-gray-700 transition shadow-md cursor-pointer z-10"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                isWishlisted
                  ? "fill-rose-500 text-rose-500"
                  : "text-gray-600 hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* Listing Details */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {listing.location}, {listing.country}
          </p>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-gray-900 font-bold text-base">
              &#8377;{listing.price?.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal text-gray-500">/ night</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;