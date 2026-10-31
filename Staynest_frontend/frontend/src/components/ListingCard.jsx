import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import API from "../api/axios";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60";

const ListingCard = ({ listing, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Get token
    let token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      const storedUser = localStorage.getItem("user");
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        token = parsedUser?.token;
      } catch (err) {
        token = null;
      }
    }

    // 2. If no valid token found, go to login
    if (!token || token === "undefined") {
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
      console.error("Wishlist toggle error details:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Avoid "Costa Rica, Costa Rica" when location and country match
  const place =
    listing.location && listing.country &&
    listing.location.trim().toLowerCase() !== listing.country.trim().toLowerCase()
      ? `${listing.location}, ${listing.country}`
      : listing.location || listing.country || "";

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="block group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
    >
      <article className="h-full flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
        {/* Image + wishlist */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={listing.image?.url || FALLBACK_IMAGE}
            alt={listing.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* subtle top gradient so the heart stays visible on bright photos */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={loading}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md transition-all hover:bg-white hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              loading ? "opacity-60 cursor-wait" : "cursor-pointer"
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                isWishlisted
                  ? "fill-rose-500 text-rose-500"
                  : "text-gray-600 group-hover:text-gray-800"
              }`}
            />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 p-4">
          <h3
            title={listing.title}
            className="font-semibold text-base sm:text-lg leading-snug text-gray-900 line-clamp-2 min-h-[2.75rem] sm:min-h-[3.5rem]"
          >
            {listing.title}
          </h3>

          {place && (
            <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{place}</span>
            </p>
          )}

          <div className="mt-auto pt-3">
            <p className="text-gray-900 font-bold text-base">
              &#8377;{listing.price?.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal text-gray-500">/ night</span>
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ListingCard;