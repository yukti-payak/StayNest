import Review from "../models/Review.js";

export const isReviewAuthor = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this review" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message || "Authorization check failed" });
  }
};