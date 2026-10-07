import express from "express";
import {
  createCheckoutSession,
  confirmPayment,
  getBookedDates,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Fetch booked dates for calendar disabling
router.get("/listing/:listingId/booked-dates", getBookedDates);

// Protected: Checkout & Payment Confirmation
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/confirm-payment", protect, confirmPayment);
router.get("/my-bookings", protect, getUserBookings);

export default router;