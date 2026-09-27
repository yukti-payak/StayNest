import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, AlertCircle } from "lucide-react";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Missing payment session identifier.");
        setLoading(false);
        return;
      }

      try {
        const res = await API.post("/bookings/confirm-payment", { sessionId });
        if (res.data.success) {
          setBooking(res.data.booking);
        } else {
          setError(res.data.message || "Payment verification failed.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to confirm payment status."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto px-4 py-16 w-full flex items-center justify-center">
        {loading ? (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm font-medium">
              Confirming your payment...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center w-full">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Error
            </h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <Link
              to="/"
              className="inline-block bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-600 transition-all"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center w-full">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Your reservation for{" "}
              <span className="font-semibold text-gray-800">
                {booking?.listing?.title}
              </span>{" "}
              has been placed.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-left text-xs space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Check-In:</span>
                <span className="font-semibold">
                  {new Date(booking?.checkIn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-Out:</span>
                <span className="font-semibold">
                  {new Date(booking?.checkOut).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold">Total Paid:</span>
                <span className="font-bold text-rose-600">
                  ₹{Number(booking?.totalPrice).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Link
              to="/"
              className="inline-block w-full bg-slate-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-slate-800 transition-all"
            >
              Back to Explore
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BookingSuccess;