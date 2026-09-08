import express from "express";
import { createReview, deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isReviewAuthor } from "../middleware/isReviewAuthor.js";

const router = express.Router({ mergeParams: true });

// POST /api/listings/:id/reviews
router.post("/", protect, createReview);

// DELETE /api/listings/:id/reviews/:reviewId
router.delete("/:reviewId", protect, isReviewAuthor, deleteReview);

export default router;