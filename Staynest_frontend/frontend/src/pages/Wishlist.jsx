// pages/Wishlist.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await API.get("/wishlist");
        setWishlistItems(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading wishlist...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            You haven't saved any listings to your wishlist yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((listing) => (
              <ListingCard key={listing._id} listing={listing} initialWishlisted={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;