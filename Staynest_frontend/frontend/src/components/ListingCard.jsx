import React from "react";
import { Link } from "react-router-dom";

const ListingCard = ({ listing }) => {
  return (
    <Link to={`/listings/${listing._id}`} className="block group">
      <div className="cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={listing.image?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">{listing.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{listing.location}, {listing.country}</p>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-gray-900 font-bold text-base">
              &#8377;{listing.price?.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal text-gray-500">/ night</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;