import React, { useState } from "react";
import API from "../api/axios";
import { Calendar, CreditCard } from "lucide-react";

const BookingCard = ({ listing }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/bookings/create-checkout-session", {
        listingId: listing._id,
        checkIn,
        checkOut,
      });

      // Redirect guest to hosted Stripe Checkout page
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      alert(error.response?.data?.message || "Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-3xl p-6 shadow-xl bg-white space-y-4 max-w-sm w-full">
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-black">₹{listing.price.toLocaleString("en-IN")}</span>
        <span className="text-xs text-slate-500">/ night</span>
      </div>

      <div className="border rounded-2xl overflow-hidden divide-y text-xs text-slate-600">
        <div className="p-3 bg-slate-50">
          <label className="block font-bold text-[10px] text-slate-400 uppercase">Check-In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent w-full font-semibold focus:outline-none mt-1"
          />
        </div>
        <div className="p-3 bg-slate-50">
          <label className="block font-bold text-[10px] text-slate-400 uppercase">Check-Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent w-full font-semibold focus:outline-none mt-1"
          />
        </div>
      </div>

      <button
        disabled={loading}
        onClick={handleCheckout}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
      >
        <CreditCard className="w-4 h-4" />
        {loading ? "Redirecting to Stripe…" : "Reserve & Pay"}
      </button>
    </div>
  );
};

export default BookingCard;