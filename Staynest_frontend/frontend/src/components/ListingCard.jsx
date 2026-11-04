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

    let token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        token = storedUser ? JSON.parse(storedUser)?.token : null;
      } catch (err) {
        token = null;
      }
    }

    if (!token || token === "undefined") {
      navigate("/login");
      return;
    }

    // Optimistic update, rolled back on failure
    setLoading(true);
    setIsWishlisted((prev) => !prev);
    try {
      const res = await API.post("/wishlist/toggle", { listingId: listing._id });
      if (!res.data.success) setIsWishlisted((prev) => !prev);
    } catch (err) {
      setIsWishlisted((prev) => !prev);
      console.error("Wishlist toggle error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Your session expired. Please log in again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Avoid "Costa Rica, Costa Rica"
  const place =
    listing.location &&
    listing.country &&
    listing.location.trim().toLowerCase() !== listing.country.trim().toLowerCase()
      ? `${listing.location}, ${listing.country}`
      : listing.location || listing.country || "";

  const imageUrl =
    typeof listing.image === "string"
      ? listing.image
      : listing.image?.url || FALLBACK_IMAGE;

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="block group rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
    >
      <article className="h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={imageUrl}
            alt={listing.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={loading}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md transition hover:bg-white hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              loading ? "opacity-70 cursor-wait" : "cursor-pointer"
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-200 ${
                isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-700"
              }`}
            />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 pt-3 px-1">
          <h3
            title={listing.title}
            className="font-semibold text-base leading-snug text-gray-900 line-clamp-2 min-h-[2.75rem] group-hover:text-rose-600 transition-colors"
          >
            {listing.title}
          </h3>

          {place && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{place}</span>
            </p>
          )}

          <p className="mt-auto pt-2 text-gray-900 font-bold">
            &#8377;{Number(listing.price || 0).toLocaleString("en-IN")}{" "}
            <span className="text-sm font-normal text-gray-500">/ night</span>
          </p>
        </div>
      </article>
    </Link>
  );
};

export default ListingCard;