import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Edit, Trash2, User, Star, MapPin } from "lucide-react";

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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-snug">
              {listing.title}
            </h1>
            {avgRating && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium text-gray-700">{avgRating}</span>
                <span>
                  · {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/listings/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300 transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg hover:border-rose-300 disabled:opacity-50 transition cursor-pointer"
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
        <div className="w-full h-[280px] sm:h-[420px] rounded-xl overflow-hidden bg-gray-100 mb-8">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Price + host */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-gray-100">
          {listing.price && (
            <div>
              <div className="text-2xl font-semibold text-gray-900">
                &#8377;{Number(listing.price).toLocaleString("en-IN")}
                <span className="text-base font-normal text-gray-400"> / night</span>
              </div>
            </div>
          )}

          {ownerName && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <p className="text-gray-400 leading-tight">Hosted by</p>
                <p className="font-medium text-gray-800 leading-tight">{ownerName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-10">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            About this stay
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {listing.description || "No description available for this stay."}
          </p>
        </div>

        {/* Reviews */}
        <div className="pt-8 border-t border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {reviewCount > 0 ? `${reviewCount} Review${reviewCount !== 1 ? "s" : ""}` : "Reviews"}
          </h2>

          {/* Review form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="mb-8">
              {reviewError && (
                <p className="text-sm text-rose-500 mb-3">{reviewError}</p>
              )}

              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 cursor-pointer"
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

              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience staying here…"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-rose-400 resize-none transition"
                required
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="mt-3 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition cursor-pointer"
              >
                {submittingReview ? "Submitting…" : "Post review"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500 mb-8">
              <Link to="/login" className="text-rose-500 font-medium hover:underline">
                Log in
              </Link>{" "}
              to leave a review.
            </p>
          )}

          {/* Review list */}
          {reviewCount > 0 ? (
            <ul className="divide-y divide-gray-100">
              {listing.reviews.map((rev) => {
                const isReviewAuthor =
                  user &&
                  rev.author &&
                  (user._id === rev.author._id || user._id === rev.author);

                const authorName =
                  rev.author?.name || rev.author?.username || "Anonymous";

                return (
                  <li key={rev._id} className="py-5 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {authorName}
                        </p>
                        <div className="flex items-center gap-0.5 mt-1 mb-2">
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
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>

                      {isReviewAuthor && (
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="text-gray-300 hover:text-rose-500 transition cursor-pointer shrink-0"
                          aria-label="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm italic">
              No reviews yet — be the first to share your experience.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShowListing;