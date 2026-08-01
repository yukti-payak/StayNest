import express from "express";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getAllListings);

router.get("/:id", getListingById);

router.post("/", protect, upload.single("image"), createListing);

router.put("/:id", protect, upload.single("image"), updateListing);

router.delete("/:id", protect, deleteListing);

export default router;