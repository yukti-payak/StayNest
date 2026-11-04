import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  AlertCircle,
  Star,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  MapPin,
  Maximize2,
  ShieldCheck,
  X,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";

const escapeHtml = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const dateFieldClass =
  "w-full bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-medium focus:outline-none cursor-pointer";

const ShowListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Booking state
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  // Review form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}`);
        setListing(res.data.data || res.data);
      } catch (err) {
        setError("This listing was not found, or the server is unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await API.get(`/bookings/listing/${id}/booked-dates`);
        setBookedIntervals(
          res.data.map((b) => ({
            start: new Date(b.checkIn),
            end: new Date(b.checkOut),
          }))
        );
      } catch (err) {
        console.error("Failed to load booked dates.");
      }
    };
    fetchBookedDates();
  }, [id]);

  // Price calculation
  const nights =
    checkIn && checkOut
      ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      : 0;
  const basePrice = nights > 0 ? nights * Number(listing?.price || 0) : 0;
  const serviceFee = nights > 0 ? Math.round(basePrice * 0.08) : 0;
  const totalPrice = basePrice + serviceFee;

  const handleBooking = async () => {
    if (!user) {
      setBookingMessage("Log in to reserve this stay.");
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingMessage("Choose your check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setBookingMessage("Check-out must be after check-in.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    try {
      const res = await API.post("/bookings/create-checkout-session", {
        listingId: listing._id,
        checkIn,
        checkOut,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setBookingMessage("Could not start the payment session. Try again.");
      }
    } catch (err) {
      setBookingMessage(
        err.response?.data?.message || "Could not start the payment session."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Map
  useEffect(() => {
    if (!listing || !mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
    const coordinates = listing.geometry?.coordinates || [77.209, 28.6139];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: 12,
      scrollZoom: false,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    new mapboxgl.Marker({ color: "#e11d48" })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding:4px 2px;">
            <h4 style="font-weight:700;margin:0 0 2px;font-size:13px;">${escapeHtml(listing.title)}</h4>
            <p style="font-size:11px;color:#666;margin:0;">Exact location is shared after booking</p>
          </div>`
        )
      )
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [listing]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this listing? This action cannot be undone."
      )
    )
      return;

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("Write a few words about your stay before posting.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await API.post(`/listings/${id}/reviews`, { rating, comment });
      const addedReview = res.data.review;
      setListing((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), addedReview],
      }));
      setComment("");
      setRating(5);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Could not post your review. Try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
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

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 animate-pulse">
          <div className="h-9 w-2/3 bg-gray-100 rounded-lg mb-3" />
          <div className="h-4 w-1/4 bg-gray-100 rounded mb-6" />
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 h-[420px] bg-gray-100 rounded-3xl" />
            <div className="h-72 bg-gray-100 rounded-3xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto my-24 px-6 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Listing unavailable
          </h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors"
          >
            Back to explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl =
    typeof listing.image === "string"
      ? listing.image
      : listing.image?.url || FALLBACK_IMAGE;

  const isOwner =
    user &&
    listing?.owner &&
    (user._id === listing.owner._id || user._id === listing.owner);

  const ownerName =
    typeof listing.owner === "object"
      ? listing.owner?.username || listing.owner?.name || listing.owner?.email || "Verified host"
      : "Verified host";

  const reviews = listing.reviews || [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
      : null;

  const place =
    listing.location &&
    listing.country &&
    listing.location.trim().toLowerCase() !== listing.country.trim().toLowerCase()
      ? `${listing.location}, ${listing.country}`
      : listing.location || listing.country || "";

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Title row */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              {averageRating && (
                <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {averageRating}
                  <span className="font-normal text-gray-500">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </span>
              )}
              {place && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  {place}
                </span>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/listings/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-xl text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* Hero image */}
        <button
          type="button"
          onClick={() => setShowGalleryModal(true)}
          aria-label="View photo full screen"
          className="group relative block w-full h-[260px] sm:h-[380px] lg:h-[460px] rounded-3xl overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
        >
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3.5 py-2 rounded-full text-sm font-semibold text-gray-900 shadow-md">
            <Maximize2 className="w-4 h-4" />
            View photo
          </span>
        </button>

        {/* Content + booking */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 min-w-0">
            {/* Host */}
            <div className="pb-6 border-b border-gray-200 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Stay hosted by {ownerName}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{place}</p>
              </div>
              <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                {ownerName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* About */}
            <section className="py-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                About this space
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line max-w-prose">
                {listing.description}
              </p>
            </section>

            {/* Map */}
            <section className="py-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Where you'll be</h3>
              <p className="text-sm text-gray-500 mt-0.5 mb-4">{place}</p>
              <div
                ref={mapContainerRef}
                className="w-full h-[320px] sm:h-[380px] rounded-2xl border border-gray-200 overflow-hidden"
              />
            </section>

            {/* Reviews */}
            <section className="py-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  {averageRating
                    ? `${averageRating} · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
                    : "Guest reviews"}
                </h3>
              </div>

              {/* Review form */}
              {user ? (
                <div className="mb-8 p-5 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-3">
                    Leave a review
                  </h4>

                  {reviewError && (
                    <div
                      role="alert"
                      className="p-3 mb-4 bg-rose-50 text-rose-700 rounded-xl text-sm flex items-center gap-2 border border-rose-100"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {reviewError}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div
                      className="flex items-center gap-1"
                      role="radiogroup"
                      aria-label="Rating"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          role="radio"
                          aria-checked={rating === star}
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-semibold text-gray-600">
                        {hoverRating || rating} / 5
                      </span>
                    </div>

                    <textarea
                      rows="4"
                      placeholder="What did you like about your stay?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition bg-white resize-none"
                      required
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submittingReview ? "Posting…" : "Post review"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-600">
                  <Link to="/login" className="font-semibold text-rose-600 hover:underline">
                    Log in
                  </Link>{" "}
                  to share your experience with other travelers.
                </div>
              )}

              {/* Review list */}
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((rev) => {
                    const isReviewAuthor =
                      user &&
                      rev.author &&
                      (user._id === rev.author._id || user._id === rev.author);
                    const authorName =
                      rev.author?.username || rev.author?.name || "Guest";

                    return (
                      <article
                        key={rev._id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                {authorName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900 text-sm truncate">
                                {authorName}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              {rev.rating}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>

                        {isReviewAuthor && (
                          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-semibold transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">
                  No reviews yet. Be the first to review this stay.
                </p>
              )}
            </section>
          </div>

          {/* Right column: booking card */}
          <aside className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl shadow-gray-200/60">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <span className="text-3xl font-extrabold text-gray-900">
                    {inr(listing.price)}
                  </span>
                  <span className="text-gray-500 text-sm"> / night</span>
                </div>
                {averageRating && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {averageRating}
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="border border-gray-300 rounded-2xl mb-4 bg-white focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100 transition">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  <div className="px-3.5 py-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                      Check-in
                    </label>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => {
                        setCheckIn(date);
                        if (checkOut && date >= checkOut) setCheckOut(null);
                      }}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      excludeDateIntervals={bookedIntervals}
                      placeholderText="Add date"
                      dateFormat="d MMM yyyy"
                      wrapperClassName="w-full"
                      popperPlacement="bottom-start"
                      className={dateFieldClass}
                    />
                  </div>

                  <div className="px-3.5 py-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                      Check-out
                    </label>
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={checkIn || new Date()}
                      excludeDateIntervals={bookedIntervals}
                      placeholderText="Add date"
                      dateFormat="d MMM yyyy"
                      wrapperClassName="w-full"
                      popperPlacement="bottom-end"
                      className={dateFieldClass}
                    />
                  </div>
                </div>
              </div>

              {bookingMessage && (
                <div
                  role="alert"
                  className={`mb-4 text-sm font-medium p-3 rounded-xl border ${
                    bookingMessage.toLowerCase().includes("success")
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-rose-700 bg-rose-50 border-rose-200"
                  }`}
                >
                  {bookingMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-bold text-base rounded-2xl transition shadow-md shadow-rose-200 disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Reserve stay"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                You won't be charged yet.
              </p>

              {nights > 0 && (
                <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {inr(listing.price)} × {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span className="font-medium text-gray-900">{inr(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service fee</span>
                    <span className="font-medium text-gray-900">{inr(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-100 pt-3">
                    <span>Total</span>
                    <span>{inr(totalPrice)}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure online checkout
            </p>
          </aside>
        </div>
      </main>

    

      {/* Fullscreen image modal */}
      {showGalleryModal && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowGalleryModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setShowGalleryModal(false)}
            aria-label="Close"
            className="absolute top-5 right-5 text-white hover:bg-white/20 p-2.5 bg-white/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={imageUrl}
            alt={listing.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default ShowListing;