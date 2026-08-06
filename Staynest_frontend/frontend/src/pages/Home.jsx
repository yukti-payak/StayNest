import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await API.get("/listings");
        setListings(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch listings. Make sure your backend server is running on port 8080.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Explore Places</h1>

        {loading && (
          <div className="text-center py-12 text-gray-500 font-medium">
            Loading listings...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No listings found in database.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;