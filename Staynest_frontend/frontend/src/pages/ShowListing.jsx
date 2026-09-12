import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Edit,
  Trash2,
  User,
  Star,
  MapPin,
  MessageSquare,
  AlertCircle,
  Share2,
  Heart,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

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

  // Delete Listing Action
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

  // Add Review Action
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Please write a comment for your review.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await API.post(`/listings/${id}/reviews`, {
        rating,
        comment,
      });

      const addedReview = res.data.review;
      setListing((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), addedReview],
      }));

      setComment("");
      setRating(5);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Failed to post review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete Review Action
  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/listings/${id}/reviews/${reviewId}`);

      setListing((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((rev) => rev._id !== reviewId),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium animate-pulse">
            Loading stay details…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto my-24 px-6 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Listing Unavailable</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-600 shadow-sm transition-all"
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

  const isOwner =
    user &&
    listing?.owner &&
    (user._id === listing.owner._id || user._id === listing.owner);

  const ownerName =
    typeof listing.owner === "object"
      ? listing.owner?.name || listing.owner?.username || listing.owner?.email
      : "Verified Host";

  const reviewCount = listing.reviews?.length || 0;
  const avgRating = reviewCount
    ? (
        listing.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        reviewCount
      ).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title & Quick Info Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-sm text-gray-600">
                {avgRating ? (
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{avgRating}</span>
                    <span className="text-gray-400 font-normal">
                      ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                    New Listing
                  </span>
                )}

                {(listing.location || listing.country) && (
                  <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>
                      {[listing.location, listing.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to={`/listings/${id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? "Deleting…" : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Gallery Card */}
        <div className="relative w-full h-[320px] sm:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden bg-gray-200 mb-10 shadow-sm border border-gray-100">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-700 hover:text-rose-500 shadow-md hover:bg-white transition">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-700 hover:text-gray-900 shadow-md hover:bg-white transition">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details & Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Host Banner */}
            <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-rose-50">
                  {ownerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Hosted by {ownerName}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" /> Identity Verified Superhost
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Book
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                About this stay
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
                {listing.description || "No description provided for this property."}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      Guest Reviews
                    </h2>
                    <p className="text-xs text-gray-400">
                      Authentic feedback from verified guests
                    </p>
                  </div>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-sm text-amber-900">{avgRating} / 5.0</span>
                  </div>
                )}
              </div>

              {/* Review Input Form */}
              {user ? (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mb-10 bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-gray-200/90 focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all"
                >
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    Leave a Review
                  </h3>

                  {reviewError && (
                    <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Your Rating:
                    </span>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 text-gray-300 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              star <= (hoverRating || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your stay, amenities, neighborhood, or experience..."
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 resize-none shadow-sm transition"
                    required
                  />

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400 font-medium">
                      {comment.length} characters
                    </span>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                    >
                      {submittingReview ? "Submitting…" : "Post Review"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5 border border-rose-100 p-6 rounded-2xl text-center mb-10 shadow-sm">
                  <p className="text-sm text-gray-700 font-medium">
                    Have you stayed at this property?{" "}
                    <Link
                      to="/login"
                      className="text-rose-600 font-bold hover:underline"
                    >
                      Log in
                    </Link>{" "}
                    to leave a review.
                  </p>
                </div>
              )}

              {/* Review Cards Grid (Side by Side layout) */}
              {reviewCount > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.reviews.map((rev) => {
                    const isReviewAuthor =
                      user &&
                      rev.author &&
                      (user._id === rev.author._id || user._id === rev.author);

                    const authorName =
                      rev.author?.name || rev.author?.username || "Guest User";

                    const createdAt = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently";

                    return (
                      <div
                        key={rev._id}
                        className="bg-slate-50/70 border border-gray-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Review Author Header */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                {authorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                  {authorName}
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {createdAt}
                                </p>
                              </div>
                            </div>

                            {/* Delete Review Button */}
                            {isReviewAuthor && (
                              <button
                                onClick={() => handleDeleteReview(rev._id)}
                                className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                aria-label="Delete review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center gap-0.5 mb-3 bg-white px-2 py-1 rounded-lg border border-gray-100 w-fit shadow-2xs">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Comment Body */}
                          <p className="text-sm text-gray-600 leading-relaxed break-words font-normal">
                            "{rev.comment}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 font-bold text-sm">No reviews posted yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Be the first traveler to review this stay.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking / Price Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-baseline justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-3xl font-black text-gray-900">
                    &#8377;{Number(listing.price || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-500 font-medium"> / night</span>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{avgRating}</span>
                  </div>
                )}
              </div>

              {/* Mock Booking Date Selectors */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-200">
                <div className="grid grid-cols-2 divide-x divide-gray-200 bg-slate-50/50">
                  <div className="p-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">
                      Check-In
                    </label>
                    <span className="text-xs font-semibold text-gray-700">Add date</span>
                  </div>
                  <div className="p-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">
                      Check-Out
                    </label>
                    <span className="text-xs font-semibold text-gray-700">Add date</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/50">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">
                    Guests
                  </label>
                  <span className="text-xs font-semibold text-gray-700">1 guest</span>
                </div>
              </div>

              <button
                onClick={() => alert("Booking functionality coming soon!")}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                Reserve Stay
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-400">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShowListing;