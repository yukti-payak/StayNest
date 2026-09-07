import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Edit, Trash2, User, MapPin } from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Read logged-in user directly from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

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

  // Handle Delete Action
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await API.delete(`/listings/${id}`);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete listing.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">
            Loading stay details...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm h-fit">
          <p className="text-rose-500 font-medium mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-rose-600 transition shadow-md shadow-rose-200"
          >
            Back to Explore
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

  // Check if the logged in user is the owner
  const isOwner =
    user &&
    listing?.owner &&
    (user._id === listing.owner._id || user._id === listing.owner);

  // Extract owner display name safely
  const ownerName =
    typeof listing.owner === "object"
      ? listing.owner?.name || listing.owner?.username || listing.owner?.email
      : null;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <article className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Title Header & Owner Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {listing.title}
              </h1>

              {/* Location Tag */}
              {listing.location && (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{listing.location}</span>
                </div>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-2.5 shrink-0 pt-1">
                <Link
                  to={`/listings/${id}/edit`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition shadow-xs"
                >
                  <Edit className="w-4 h-4 text-gray-500" /> Edit
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-rose-200 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* Hero Image */}
          <div className="relative w-full h-[350px] sm:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-inner group">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Key Information Highlight Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-rose-50/30 to-gray-50 border border-gray-100">
            {/* Price Badge */}
            {listing.price && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  &#8377;{Number(listing.price).toLocaleString("en-IN")}
                </span>
                <span className="text-gray-500 font-medium text-sm">/ night</span>
              </div>
            )}

            {/* Host Badge */}
            {ownerName && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
                    Hosted By
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {ownerName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-gray-900">About this stay</h2>
            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
              {listing.description || "No description available for this stay."}
            </p>
          </div>

        </article>
      </main>
    </div>
  );
};

export default ShowListing;