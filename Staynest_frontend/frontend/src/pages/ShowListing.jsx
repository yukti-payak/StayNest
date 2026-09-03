import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft, Edit, Trash2, MapPin, Tag } from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Read logged-in user directly from localStorage
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
      <div className="min-h-screen bg-white flex flex-col">
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

  // 2. Check if the parsed localStorage user matches the listing owner ID
  const isOwner =
    user &&
    listing?.owner &&
    (user._id === listing.owner._id || user._id === listing.owner);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Navigation & Owner Actions Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-rose-500 transition px-3 py-1.5 rounded-lg hover:bg-gray-100 -ml-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </Link>

          {/* EDIT & DELETE BUTTONS (Renders only if user matches listing owner) */}
          {isOwner && (
            <div className="flex items-center gap-3">
              <Link
                to={`/listings/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
              >
                <Edit className="w-4 h-4 text-gray-600" /> Edit
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* Title & Metadata */}
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {listing.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {listing.location && (
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-4 h-4 text-rose-500" />
                {listing.location}
                {listing.country ? `, ${listing.country}` : ""}
              </span>
            )}
            {listing.price && (
              <span className="flex items-center gap-1 font-semibold text-gray-900">
                <Tag className="w-4 h-4 text-rose-500" />
                &#8377;{Number(listing.price).toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-gray-500">/ night</span>
              </span>
            )}
            {listing.owner?.username && (
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-700 font-medium">
                Hosted by @{listing.owner.username}
              </span>
            )}
          </div>
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