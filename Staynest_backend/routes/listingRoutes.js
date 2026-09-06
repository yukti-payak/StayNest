import express from "express";
import multer from "multer";
import { storage } from "../config/cloudConfig.js";
import { protect } from "../middleware/authMiddleware.js"; // 1. Added protect import

import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";

const router = express.Router();

const upload = multer({ storage });

// Read Routes
router.get("/", getAllListings);
router.get("/:id", getListingById);

// Write Routes
// 2. Added "/" and "/:id" paths as the first arguments
router.post("/", protect, upload.single("image"), createListing);
router.put("/:id", protect, upload.single("listing[image]"), updateListing);
router.delete("/:id", protect, deleteListing);

export default router;