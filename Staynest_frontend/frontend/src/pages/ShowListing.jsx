import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  MapPin,
  Star,
  Share2,
  Heart,
  ShieldCheck,
  Wifi,
  Car,
  Tv,
  Coffee,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";

const ShowListing = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}`);
        // Adjust depending on whether backend returns { data: ... } or raw object
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading stay details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-xl mx-auto mt-16 p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-rose-600 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Fallback image handling
  const imageUrl =
    typeof listing.image === "string"
      ? listing.image
      : listing.image?.url ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";

  const price = listing.price || 0;
  const serviceFee = Math.round(price * 0.12);
  const totalPrice = price + serviceFee;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-rose-500 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </Link>

          <div className="flex items-center gap-3 text-sm font-medium">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition text-gray-700 cursor-pointer">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition text-gray-700 cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>

        {/* Header Title & Quick Details */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1 font-semibold text-gray-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.92</span>
              <span className="text-gray-400 font-normal">(48 reviews)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-gray-700 font-medium">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>
                {listing.location}, {listing.country}
              </span>
            </div>
          </div>
        </div>

        {/* Image Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden mb-10 shadow-sm border border-gray-100">
          <div className="md:col-span-3 aspect-[16/10] md:aspect-auto md:h-[420px] bg-gray-100 overflow-hidden relative group">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
            />
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Top Rated Stay
            </span>
          </div>

          <div className="hidden md:flex flex-col gap-3 h-[420px]">
            <div className="h-1/2 bg-gray-100 overflow-hidden relative group rounded-tr-none">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
                alt="Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="h-1/2 bg-gray-100 overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811"
                alt="Bedroom"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Section */}
            <div className="flex items-center justify-between border-b pb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Entire villa hosted by Superhost
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  6 guests • 3 bedrooms • 3 beds • 2 baths
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center font-bold text-rose-600 text-lg">
                S
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-4 border-b pb-6 text-sm">
              <div className="flex gap-4 items-start">
                <ShieldCheck className="w-5 h-5 text-gray-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Self check-in
                  </h3>
                  <p className="text-gray-500">
                    Check yourself in with the smart lock system.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Sparkles className="w-5 h-5 text-gray-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Experienced host
                  </h3>
                  <p className="text-gray-500">
                    Rated 5 stars by 100% of recent guests.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                About this space
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {listing.description ||
                  "Escape to this beautiful getaway space designed for comfort and relaxation. Featuring sleek modern amenities, high-speed WiFi, and stunning surrounding views."}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-gray-600" /> Fast Wifi
                </div>
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-gray-600" /> Free parking on
                  premises
                </div>
                <div className="flex items-center gap-3">
                  <Tv className="w-5 h-5 text-gray-600" /> 55" HDTV with Netflix
                </div>
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-gray-600" /> Coffee maker
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-gray-900">
                    &#8377;{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-500 text-sm font-normal">
                    {" "}
                    / night
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span>4.92</span>
                </div>
              </div>

              {/* Booking Inputs */}
              <div className="border border-gray-300 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="p-2.5 border-r border-gray-300 bg-gray-50/50">
                    <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                      Check-in
                    </label>
                    <input
                      type="date"
                      className="w-full bg-transparent text-gray-800 font-medium outline-none mt-0.5 cursor-pointer"
                    />
                  </div>
                  <div className="p-2.5 bg-gray-50/50">
                    <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                      Checkout
                    </label>
                    <input
                      type="date"
                      className="w-full bg-transparent text-gray-800 font-medium outline-none mt-0.5 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50/50">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-transparent text-gray-800 font-medium outline-none mt-0.5 cursor-pointer"
                  >
                    <option value={1}>1 guest</option>
                    <option value={2}>2 guests</option>
                    <option value={3}>3 guests</option>
                    <option value={4}>4 guests</option>
                  </select>
                </div>
              </div>

              {/* Reserve Button */}
              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition shadow-md active:scale-[0.98] cursor-pointer text-sm tracking-wide">
                Reserve
              </button>

              <p className="text-center text-xs text-gray-500">
                You won't be charged yet
              </p>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-3 border-t text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>
                    &#8377;{price.toLocaleString("en-IN")} x 1 night
                  </span>
                  <span>&#8377;{price.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>StayNest service fee</span>
                  <span>&#8377;{serviceFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t">
                  <span>Total before taxes</span>
                  <span>&#8377;{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShowListing;