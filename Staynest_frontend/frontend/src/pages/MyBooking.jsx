import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, IndianRupee, ArrowRight, CheckCircle2, Building2 } from "lucide-react";
import Navbar from "../components/Navbar";
import API from "../api/axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/bookings/my-bookings");
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Title Section */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-rose-500" />
            My Booked Stays
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Manage and view details for all your confirmed reservations.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse shadow-sm"
              >
                <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-12 bg-slate-100 rounded-lg w-full mb-4" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-10">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Bookings Yet
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              You haven't booked any stays yet. Explore our listings and plan your next trip!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              Explore Listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Bookings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const listing = booking.listing;
              const imageUrl =
                listing?.image?.url ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945";

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Status Tag */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={listing?.title || "Listing Image"}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">
                        {listing?.title || "Reserved Property"}
                      </h3>

                      {/* Location */}
                      {(listing?.location || listing?.country) && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {listing?.location}
                            {listing?.location && listing?.country ? ", " : ""}
                            {listing?.country}
                          </span>
                        </p>
                      )}

                      {/* Date Range Card */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs text-slate-700">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                            Check-In
                          </p>
                          <p className="font-medium mt-0.5">
                            {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200" />
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                            Check-Out
                          </p>
                          <p className="font-medium mt-0.5">
                            {new Date(booking.checkOut).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Price & Action */}
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Total Amount Paid
                      </p>
                      <p className="text-base font-bold text-rose-600 flex items-center">
                        <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                        {Number(booking.totalPrice).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {listing?._id && (
                      <Link
                        to={`/listings/${listing._id}`}
                        className="text-xs font-semibold text-slate-700 hover:text-rose-500 flex items-center gap-1 transition-colors"
                      >
                        View Stay
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;