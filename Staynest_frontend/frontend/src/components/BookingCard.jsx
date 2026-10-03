import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../api/axios";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";

const BookingCard = ({ listing }) => {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch already booked dates from backend to disable them in calendar
  useEffect(() => {
    if (!listing?._id) return;

    const fetchBookedDates = async () => {
      try {
        const res = await API.get(`/bookings/listing/${listing._id}/booked-dates`);
        const intervals = res.data.map((b) => ({
          start: new Date(b.checkIn),
          end: new Date(b.checkOut),
        }));
        setBookedIntervals(intervals);
      } catch (err) {
        console.error("Failed to load booked dates:", err);
      }
    };

    fetchBookedDates();
  }, [listing?._id]);

  // Price calculations
  const nights =
    checkIn && checkOut
      ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      : 0;

  const basePrice = nights > 0 ? nights * Number(listing?.price || 0) : 0;
  const serviceFee = nights > 0 ? Math.round(basePrice * 0.08) : 0;
  const totalPrice = basePrice + serviceFee;

  const handleCheckout = async () => {
    if (!checkIn || !checkOut) {
      setErrorMessage("Please select valid check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await API.post("/bookings/create-checkout-session", {
        listingId: listing._id,
        checkIn,
        checkOut,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setErrorMessage("Failed to initiate payment session.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Payment initiation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-3xl p-6 shadow-xl bg-white space-y-5 max-w-sm w-full">
      {/* Header Price Section */}
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-2xl font-black text-slate-900">
            ₹{Number(listing?.price || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-500 font-medium"> / night</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modern Date Selection Grid */}
      <div className="border border-slate-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent transition-all bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          {/* Check-In Field */}
          <div className="p-3 hover:bg-slate-100/80 transition-colors cursor-pointer">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-rose-500" />
              Check-In
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
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* Check-Out Field */}
          <div className="p-3 hover:bg-slate-100/80 transition-colors cursor-pointer">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-rose-500" />
              Check-Out
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
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
          <div className="flex justify-between text-slate-600">
            <span>
              ₹{Number(listing.price).toLocaleString("en-IN")} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </span>
            <span className="font-semibold text-slate-900">
              ₹{basePrice.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Service fee (8%)</span>
            <span className="font-semibold text-slate-900">
              ₹{serviceFee.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-100 pt-2.5">
            <span>Total</span>
            <span className="text-rose-600 font-black">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        disabled={loading}
        onClick={handleCheckout}
        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm disabled:opacity-50 cursor-pointer"
      >
        <CreditCard className="w-4 h-4" />
        {loading ? "Redirecting to Stripe…" : "Reserve & Pay"}
      </button>

      <p className="text-[10px] text-slate-400 text-center font-medium">
        You won't be charged until the next step.
      </p>
    </div>
  );
};

export default BookingCard;