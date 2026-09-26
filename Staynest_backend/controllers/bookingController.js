import Booking from "../models/Booking.js";
import Listing from "../models/Listing.js";

// 1. Create a New Booking
export const createBooking = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    const userId = req.user._id; // Assumes auth middleware populates req.user

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Check for overlapping confirmed bookings
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: "confirmed",
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "This listing is already booked for the selected dates.",
      });
    }

    // Calculate total price based on number of nights
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    const newBooking = await Booking.create({
      listing: listingId,
      user: userId,
      checkIn: start,
      checkOut: end,
      totalPrice,
    });

    res.status(201).json({ message: "Booking confirmed!", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Fetch Booked Dates for a Listing (To disable dates on UI calendar)
export const getListingBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;
    const bookings = await Booking.find({
      listing: listingId,
      status: "confirmed",
    }).select("checkIn checkOut");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};