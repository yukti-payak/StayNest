import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Edit, Trash2, User, Star, MapPin, MessageSquare, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading stay details…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto my-24 px-6 text-center">
          <p className="text-gray-700 font-medium mb-5">{error}</p>
          <Link
            to="/"
            className="inline-block bg-rose-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-rose-600 transition"
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

  const reviewCount = listing.reviews?.length || 0;
  const avgRating = reviewCount
    ? (
        listing.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        reviewCount
      ).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug tracking-tight">
              {listing.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              {avgRating && (
                <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{avgRating}</span>
                  <span className="text-gray-400 font-normal">
                    ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
              {listing.location && listing.country && (
                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {listing.location}, {listing.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/listings/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 shadow-sm disabled:opacity-50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {deleting ? "Deleting…" : "Delete"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Hero image */}
        <div className="w-full h-[280px] sm:h-[420px] rounded-2xl overflow-hidden bg-gray-100 mb-8 shadow-sm">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Price + host */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-gray-200/80">
          {listing.price && (
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                &#8377;{Number(listing.price).toLocaleString("en-IN")}
                <span className="text-base font-normal text-gray-500"> / night</span>
              </div>
            </div>
          )}

          {ownerName && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 font-semibold text-sm">
                {ownerName.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="text-gray-400 text-xs">Hosted by</p>
                <p className="font-semibold text-gray-800 leading-tight">{ownerName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            About this stay
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {listing.description || "No description available for this stay."}
          </p>
        </div>

        {/* Reviews Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              <span>
                {reviewCount > 0
                  ? `${reviewCount} Review${reviewCount !== 1 ? "s" : ""}`
                  : "Guest Reviews"}
              </span>
            </h2>
            {avgRating && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-xs text-amber-900">{avgRating} out of 5</span>
              </div>
            )}
          </div>

          {/* Review form */}
          {user ? (
            <form
              onSubmit={handleReviewSubmit}
              className="mb-12 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm transition-all focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-500/5"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Leave a Review
              </h3>

              {reviewError && (
                <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
                  Rating:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-gray-300 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                      aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
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
                placeholder="Share details of your experience at this property..."
                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-rose-400 resize-none transition"
                required
              />

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {submittingReview ? "Submitting…" : "Post Review"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 p-6 rounded-2xl text-center mb-10 shadow-sm">
              <p className="text-sm text-gray-700">
                Have you stayed here?{" "}
                <Link
                  to="/login"
                  className="text-rose-600 font-semibold hover:underline"
                >
                  Log in
                </Link>{" "}
                to share your feedback with future guests.
              </p>
            </div>
          )}

          {/* Review Grid (Side-by-side) */}
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
                  : null;

                return (
                  <div
                    key={rev._id}
                    className="bg-white border border-gray-200/70 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <div>
                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-sm shrink-0">
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                              {authorName}
                            </h4>
                            {createdAt && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {createdAt}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        {isReviewAuthor && (
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Stars badge */}
                      <div className="flex items-center gap-0.5 mb-3 bg-amber-50/80 px-2 py-1 rounded-lg w-fit">
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

                      {/* Comment text */}
                      <p className="text-sm text-gray-600 leading-relaxed break-words">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">No reviews yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Be the first person to share your experience staying here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShowListing;