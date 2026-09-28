import express from "express";
import { toggleWishlist, getUserWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect middleware to all wishlist routes
router.use(protect);

router.post("/toggle", toggleWishlist);
router.get("/", getUserWishlist);

export default router;