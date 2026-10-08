import express from "express";
import { askCoHost } from "../controllers/coHostController.js";
import { protect } from "../middleware/authMiddleware.js"; // Adjust middleware name as needed

const router = express.Router();

router.post("/ask", protect, askCoHost);

export default router;