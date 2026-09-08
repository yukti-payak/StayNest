import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Edit, Trash2, User, Star } from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
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

      // Append new review to local state
      const addedReview = res.data.review;
      setListing((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), addedReview],
      }));

      // Reset form
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
      
      // Remove review from local state
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

  const isOwner =
    user &&
    listing?.owner &&
    (user._id === listing.owner._id || user._id === listing.owner);

  const ownerName =
    typeof listing.owner === "object"
      ? listing.owner?.name || listing.owner?.username || listing.owner?.email
      : null;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <article className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Centered Page Title */}
          <div className="text-center space-y-3 pb-2">
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-2xl mx-auto">
              {listing.title}
            </h1>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center justify-center gap-2.5 pt-2">
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
          <div className="relative w-full h-[360px] sm:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm group">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Details Grid: Price & Host Info */}
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
            {listing.price && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Rate
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    &#8377;{Number(listing.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-500 font-medium text-base">/ night</span>
                </div>
              </div>
            )}

            {ownerName && (
              <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
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
          <div className="space-y-4 pt-2">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              About this stay
            </h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line font-normal">
              {listing.description || "No description available for this stay."}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="pt-8 border-t border-gray-100 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>

            {/* Leave a Review Form (Authenticated Users Only) */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Leave a Review</h3>

                {reviewError && (
                  <p className="text-xs font-semibold text-rose-500">{reviewError}</p>
                )}

                {/* Rating Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Comments
                  </label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience staying here..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 p-5 rounded-2xl text-center border border-gray-100">
                <p className="text-sm text-gray-600">
                  Please{" "}
                  <Link to="/login" className="text-rose-500 font-semibold underline">
                    Log in
                  </Link>{" "}
                  to leave a review.
                </p>
              </div>
            )}

            {/* Display Reviews List */}
            <div className="space-y-4">
              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.reviews.map((rev) => {
                    const isReviewAuthor =
                      user &&
                      rev.author &&
                      (user._id === rev.author._id || user._id === rev.author);

                    const authorName =
                      rev.author?.name || rev.author?.username || "Anonymous";

                    return (
                      <div
                        key={rev._id}
                        className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">
                              @{authorName}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= rev.rating
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Author-only Delete Button */}
                        {isReviewAuthor && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No reviews yet for this stay.
                </p>
              )}
            </div>
          </div>

        </article>
      </main>
    </div>
  );
};

export default ShowListing;