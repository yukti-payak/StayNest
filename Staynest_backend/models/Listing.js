import mongoose from "mongoose";
import Review from "./Review.js";

const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      url: String,
      filename: String,
    },

    price: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

         category: {
    type: String,
    required: true, // you can make this optional if needed
    enum: [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Mountains",
      "Castles",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Arctic",
    ],
  },

    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },

    houseManual: {
      wifiName: { type: String, default: "" },
      wifiPassword: { type: String, default: "" },
      checkInInstructions: { type: String, default: "" },
      applianceRules: { type: String, default: "" },
      trashDisposal: { type: String, default: "" },
      parkingInfo: { type: String, default: "" },
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

listingSchema.index({
  title: "text",
  description: "text",
  location: "text",
});

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({
      _id: {
        $in: listing.reviews,
      },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;