import express from "express";
import { Review } from "../models/Review.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { assertRequiredString } from "../middleware/validation.js";

const router = express.Router();

router.get("/provider/:providerId", asyncHandler(async (req, res) => {
  const providerId = assertRequiredString(req.params.providerId, "providerId");
  const reviews = await Review.find({ providerId }).sort({ createdAt: -1 });
  return res.json({ reviews: reviews.map(sanitizeDoc) });
}));

export default router;
