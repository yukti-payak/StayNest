import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  AlertCircle,
  MapPin,
  Star,
  Trash2,
  Edit,
  ShieldCheck,
} from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

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

  // Mapbox Initialization Effect
  useEffect(() => {
    if (!listing || !mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

    const coordinates = listing.geometry?.coordinates || [77.209, 28.6139];

    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    new mapboxgl.Marker({ color: "#e11d48" })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 4px;"><h4 style="font-weight:700;margin-bottom:2px;">${listing.title}</h4><p style="font-size:12px;color:#666;margin:0;">Exact location provided after booking</p></div>`
        )
      )
      .addTo(mapRef.current);
  }, [listing]);

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
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading stay details…</p>
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
            className="inline-flex items-center justify-center bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-600 transition-all shadow-md hover:shadow-rose-200"
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
      ? listing.owner?.username || listing.owner?.name || listing.owner?.email
      : "Verified Host";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Clean, Normal Title Section */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {listing.title}
            </h1>
            <p className="flex items-center gap-1.5 text-gray-600 text-sm mt-1.5 font-medium">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {listing.location}, {listing.country}
              </span>
            </p>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/listings/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-xl text-xs transition-all shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-medium rounded-xl text-xs transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* Compact Image Display */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm mb-8">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-[280px] sm:h-[360px] object-cover"
          />
        </div>

        {/* Listing Details & Pricing */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm">
                {ownerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Hosted by</p>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  {ownerName}
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto border sm:border-0 border-slate-100">
              <span className="text-2xl font-black text-rose-600">
                &#8377;{Number(listing.price || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500 text-xs font-semibold"> / night</span>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" /> Where you'll be
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {listing.location}, {listing.country}
            </p>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-[280px] sm:h-[320px] rounded-xl border border-gray-200 overflow-hidden shadow-inner"
          />
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          {user && (
            <div className="mb-8 pb-8 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
              {reviewError && (
                <div className="p-3 mb-4 bg-rose-50 text-rose-600 rounded-xl text-xs flex items-center gap-2 border border-rose-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {reviewError}
                </div>
              )}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Your Experience
                  </label>
                  <textarea
                    id="comment"
                    rows="3"
                    placeholder="Describe your stay and what future visitors should know..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-slate-50/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                >
                  {submittingReview ? "Submitting…" : "Post Review"}
                </button>
              </form>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Guest Reviews
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                {listing.reviews ? listing.reviews.length : 0} total
              </span>
            </div>

            {listing.reviews && listing.reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.reviews.map((rev) => {
                  const isReviewAuthor =
                    user &&
                    rev.author &&
                    (user._id === rev.author._id || user._id === rev.author);

                  const authorName =
                    rev.author?.username || rev.author?.name || "Guest";

                  return (
                    <div
                      key={rev._id}
                      className="bg-slate-50/60 border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:border-gray-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-xs">
                              {authorName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 text-xs">
                              @{authorName}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="text-xs font-bold text-amber-700">{rev.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>

                      {isReviewAuthor && (
                        <div className="mt-4 pt-2.5 border-t border-gray-200/60 flex justify-end">
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 text-xs font-semibold transition-all"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic text-center py-4">
                No reviews yet for this listing.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ShowListing;