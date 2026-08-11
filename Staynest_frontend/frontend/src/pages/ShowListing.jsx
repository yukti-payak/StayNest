import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}`);
        setListing(res.data.data || res.data);
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
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading stay details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto my-16 p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 h-fit">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-rose-600 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl =
    typeof listing.image === "string"
      ? listing.image
      : listing.image?.url ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-rose-500 transition px-3 py-1.5 rounded-lg hover:bg-gray-100 -ml-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </Link>
        </div>

        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {listing.title}
          </h1>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[16/9] bg-gray-100 rounded-3xl overflow-hidden mb-8 border border-gray-100 shadow-sm">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Description Section */}
        <div className="bg-gray-50/50 rounded-2xl p-6 sm:p-8 border border-gray-100 space-y-3">
          <h2 className="text-xl font-bold text-gray-900">About this place</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
            {listing.description || "No description provided."}
          </p>
        </div>
      </main>
    </div>
  );
};

export default ShowListing;