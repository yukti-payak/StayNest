import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { ArrowLeft, MapPin, Tag } from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}`);
        setListing(res.data.data);
      } catch (err) {
        setError("Listing not found or server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">Loading details...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-10 p-4 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/" className="text-rose-500 hover:underline">
            &larr; Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-rose-500 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        {/* Listing Title & Location */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>
        <div className="flex items-center gap-1 text-gray-600 mb-6 text-sm sm:text-base">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>
            {listing.location}, {listing.country}
          </span>
        </div>

        {/* Listing Image */}
        <div className="rounded-2xl overflow-hidden shadow-md max-h-[450px] bg-gray-200 mb-8">
          <img
            src={listing.image?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details & Pricing Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-2xl font-bold text-gray-900">
                &#8377;{listing.price?.toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500 text-sm">per night</span>
            </div>

            <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl transition shadow-md cursor-pointer">
              Reserve Stay
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShowListing;