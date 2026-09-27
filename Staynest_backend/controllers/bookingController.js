import Booking from "../models/Booking.js";
import Stripe from "stripe";
import Listing from "../models/Listing.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Fetch Booked Dates for UI Calendar
export const getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;

    const bookings = await Booking.find(
      {
        listing: listingId,
        paymentStatus: { $in: ["paid", "pending"] },
        status: "confirmed",
      },
      "checkIn checkOut"
    );

    const bookedIntervals = bookings.map((b) => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut,
    }));

    return res.status(200).json(bookedIntervals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    
    // 1. Ensure origin always has an explicit scheme (e.g. http://)
    const origin = process.env.FRONTEND_URL || "http://localhost:5173";
    const userId = req.user._id;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Check overlapping bookings
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      paymentStatus: "paid",
      status: "confirmed",
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "This listing is already booked for the selected dates.",
      });
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = listing.price * nights;

    // 2. Stripe image URL validation: fallback if image URL is local or missing
    const imageUrl =
      listing.image?.url && listing.image.url.startsWith("http")
        ? listing.image.url
        : "https://images.unsplash.com/photo-1566073771259-6a8506099945";

    // Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
              description: `Reservation: ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${nights} night/s)`,
              images: [imageUrl],
            },
            unit_amount: totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      // 3. Use origin instead of raw process.env.FRONTEND_URL
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/listings/${listingId}`,
    });

    // Save pending booking
    await Booking.create({
      listing: listingId,
      user: userId,
      checkIn: start,
      checkOut: end,
      totalPrice,
      stripeSessionId: session.id,
      paymentStatus: "pending",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Confirm Payment After Redirect
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const booking = await Booking.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { paymentStatus: "paid" },
        { new: true }
      ).populate("listing");

      if (!booking) {
        return res.status(404).json({ message: "Booking record not found." });
      }

      return res.status(200).json({ success: true, booking });
    }

    res.status(400).json({ success: false, message: "Payment incomplete." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};