import Review from "../models/Review.js";
import Listing from "../models/Listing.js";

// Create a review
export const createReview = async (req, res) => {
  try {
    const { id } = req.params; // Listing ID
    const { comment, rating } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // 1. Save new review document
    const newReview = new Review({
      comment,
      rating,
      author: req.user._id, // Set from JWT auth middleware
    });

    await newReview.save();

    // 2. Atomic push to listing's reviews array (bypasses full listing schema validation)
    await Listing.findByIdAndUpdate(id, {
      $push: { reviews: newReview._id },
    });

    // 3. Populate author info before returning response
    await newReview.populate("author", "name username email");

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to add review" });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    // Pull the review reference from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review document
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete review" });
  }
};