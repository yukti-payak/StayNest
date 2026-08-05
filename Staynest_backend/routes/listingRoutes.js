import express from "express";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";

const router = express.Router();

router.get("/", getAllListings);
router.get("/:id", getListingById);


router.post("/", createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

export default router;