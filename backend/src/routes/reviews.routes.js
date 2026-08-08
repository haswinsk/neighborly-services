import express from "express";
import prisma from "../config/db.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { assertRequiredString } from "../middleware/validation.js";

const router = express.Router();

router.get("/provider/:providerId", asyncHandler(async (req, res) => {
  const providerId = assertRequiredString(req.params.providerId, "providerId");
  const reviews = await prisma.review.findMany({ where: { providerId }, orderBy: { createdAt: 'desc' } });
  return res.json({ reviews: reviews.map(sanitizeDoc) });
}));

export default router;
