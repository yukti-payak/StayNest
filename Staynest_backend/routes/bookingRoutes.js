import express from "express";
import { createBooking, getListingBookedDates } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js"; // Your auth middleware

const router = express.Router();

router.get("/listing/:listingId/booked-dates", getListingBookedDates);
router.post("/", protect, createBooking);

export default router;