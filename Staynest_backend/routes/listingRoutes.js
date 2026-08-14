import express from "express";
import multer from "multer";
import { storage } from "../cloudConfig.js"; // Adjust path if cloudConfig.js is located elsewhere

import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";

const router = express.Router();

// Initialize multer middleware with your Cloudinary storage
const upload = multer({ storage });

// Read Routes
router.get("/", getAllListings);
router.get("/:id", getListingById);

// Write Routes
// Add upload.single() middleware here to handle the image upload before calling the controller
router.post("/", upload.single("listing[image]"), createListing);
router.put("/:id", upload.single("listing[image]"), updateListing); // Optional: if you update images too

router.delete("/:id", deleteListing);

export default router;