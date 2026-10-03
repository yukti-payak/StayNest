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
  MapPin,
  Star,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  X,
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
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Booking State
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

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

  // Fetch Already Booked Dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await API.get(`/bookings/listing/${id}/booked-dates`);

        const intervals = res.data.map((b) => ({
          start: new Date(b.checkIn),
          end: new Date(b.checkOut),
        }));

        setBookedIntervals(intervals);
      } catch (err) {
        console.error("Failed to load booked dates.");
      }
    };

    fetchBookedDates();
  }, [id]);

  // Calculate Booking Price
  const nights =
    checkIn && checkOut
      ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      : 0;

  const basePrice = nights > 0 ? nights * Number(listing?.price || 0) : 0;
  const serviceFee = nights > 0 ? Math.round(basePrice * 0.08) : 0;
  const totalPrice = basePrice + serviceFee;

  // Handle Booking
  const handleBooking = async () => {
    if (!user) {
      setBookingMessage("Please log in to reserve this stay.");
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingMessage("Please select valid check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setBookingMessage("Check-out date must be after check-in date.");
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
        setBookingMessage("Failed to initiate payment session.");
      }
    } catch (err) {
      setBookingMessage(
        err.response?.data?.message || "Failed to create payment session."
      );
    } finally {
      setBookingLoading(false);
    }
  };

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
      zoom: 13,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    new mapboxgl.Marker({ color: "#e11d48" })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 4px;">
            <h4 style="font-weight:700;margin-bottom:2px;font-size:12px;">
              ${listing.title}
            </h4>
            <p style="font-size:10px;color:#666;margin:0;">
              Exact location provided after booking
            </p>
          </div>`
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
        err.response?.data?.message ||
          "Failed to post review. Please try again."
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
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-xs font-medium">
            Loading stay details…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto my-20 px-6 text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Listing Unavailable
          </h2>
          <p className="text-gray-600 text-xs mb-5">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-rose-500 text-white px-5 py-2 rounded-xl font-semibold text-xs hover:bg-rose-600 transition-all shadow-sm"
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
      ? listing.owner?.username ||
        listing.owner?.name ||
        listing.owner?.email
      : "Verified Host";

  const averageRating =
    listing.reviews && listing.reviews.length > 0
      ? (
          listing.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
          listing.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Title Header with Host Actions */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {listing.title}
          </h1>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/listings/${id}/edit`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg text-xs transition-all shadow-xs"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg text-xs transition-all shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
          {/* Left Column: Container for Image & Description */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="w-full h-[300px] sm:h-[360px] overflow-hidden bg-gray-100 relative">
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-300"
                onClick={() => setShowGalleryModal(true)}
              />
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Stay hosted by {ownerName}
                  </h2>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {listing.location}, {listing.country}
                  </p>
                </div>
                <div className="w-9 h-9 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                  {ownerName.charAt(0).toUpperCase()}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                  About this space
                </h3>
                <p className="text-gray-600 leading-relaxed text-xs whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Card */}
          <div className="lg:col-span-1 sticky top-20">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
              {/* Header Price Section */}
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-2xl font-black text-gray-900">
                    ₹{Number(listing.price || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-500 text-xs font-medium"> / night</span>
                </div>
                {averageRating && (
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {averageRating}
                  </div>
                )}
              </div>

              {bookingMessage && (
                <div
                  className={`mb-3 text-[11px] font-semibold p-2.5 rounded-lg ${
                    bookingMessage.includes("successful")
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      : "text-rose-700 bg-rose-50 border border-rose-200"
                  }`}
                >
                  {bookingMessage}
                </div>
              )}

              {/* Date Selection Grid */}
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-4 focus-within:ring-2 focus-within:ring-rose-500 transition-all bg-white">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  {/* Check-In */}
                  <div className="p-2.5">
                    <label className="block text-[9px] font-bold uppercase text-gray-500 tracking-wider mb-0.5 flex items-center gap-1">
                      <CalendarIcon className="w-2.5 h-2.5 text-rose-500" />
                      CHECK-IN
                    </label>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => {
                        setCheckIn(date);
                        if (checkOut && date >= checkOut) {
                          setCheckOut(null);
                        }
                      }}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      excludeDateIntervals={bookedIntervals}
                      placeholderText="Add date"
                      className="w-full text-xs font-semibold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* Check-Out */}
                  <div className="p-2.5">
                    <label className="block text-[9px] font-bold uppercase text-gray-500 tracking-wider mb-0.5 flex items-center gap-1">
                      <CalendarIcon className="w-2.5 h-2.5 text-rose-500" />
                      CHECKOUT
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
                      className="w-full text-xs font-semibold text-gray-800 focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-2 text-[11px] border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      ₹{Number(listing.price).toLocaleString("en-IN")} x {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{basePrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Service fee</span>
                    <span className="font-semibold text-gray-900">
                      ₹{serviceFee.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-xs text-gray-900 border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span className="text-rose-600 font-black">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Reserve Button */}
              <button
                type="button"
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-75 cursor-pointer flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Reserve Stay</span>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-2.5 font-medium">
                You won't be charged until the next step.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Map Section */}
        <div className="mb-8 border-t border-gray-200 pt-5">
          <div className="mb-2.5">
            <h3 className="text-base font-bold text-gray-900">Where you'll be</h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              {listing.location}, {listing.country}
            </p>
          </div>

          <div
            ref={mapContainerRef}
            className="w-full sm:w-[70%] max-w-2xl h-[340px] rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
          />
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              {averageRating ? `${averageRating} · ` : ""}Guest Reviews
            </h3>
            <span className="text-xs font-semibold px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full">
              {listing.reviews ? listing.reviews.length : 0} reviews
            </span>
          </div>

          {/* Add Review Form */}
          {user && (
            <div className="mb-8 p-6 bg-slate-50 border border-gray-200 rounded-2xl shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 mb-3">
                Leave a Review
              </h4>

              {reviewError && (
                <div className="p-3 mb-4 bg-rose-50 text-rose-600 rounded-xl text-xs flex items-center gap-2 border border-rose-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Rating:
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
                          className={`w-5 h-5 ${
                            star <= (hoverRating || rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows="4"
                    placeholder="Share details of your stay..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingReview ? "Submitting…" : "Post Review"}
                </button>
              </form>
            </div>
          )}

          {/* Comments Section */}
          {listing.reviews && listing.reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
              {listing.reviews.map((rev) => {
                const isReviewAuthor =
                  user &&
                  rev.author &&
                  (user._id === rev.author._id || user._id === rev.author);

                const authorName =
                  rev.author?.username ||
                  rev.author?.name ||
                  "Guest";

                return (
                  <div
                    key={rev._id}
                    className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-rose-200 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-[9px]">
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-[11px]">
                            {authorName}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="text-[10px] font-bold text-gray-900 ml-0.5">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-[11px] leading-snug">
                        {rev.comment}
                      </p>
                    </div>

                    {isReviewAuthor && (
                      <div className="mt-2 pt-1.5 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 text-[10px] font-semibold transition-all"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs italic py-2">
              No reviews yet for this listing.
            </p>
          )}
        </div>
      </main>

      {/* Fullscreen Image View Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowGalleryModal(false)}
            className="absolute top-5 right-5 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={imageUrl}
            alt={listing.title}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ShowListing;