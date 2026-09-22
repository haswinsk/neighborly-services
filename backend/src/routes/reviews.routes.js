import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertRequiredString } from "../middleware/validation.js";

const router = express.Router();

// Deterministic local sentiment analysis — no external API, no invented data
const analyzeReviewSentiment = (rating, comment) => {
  const lower = comment.toLowerCase();

  const positiveWords = ["great", "excellent", "amazing", "awesome", "good", "nice", "perfect", "professional", "friendly", "quick", "punctual", "reliable", "clean", "quality", "recommend", "happy", "satisfied", "best", "helpful"];
  const negativeWords = ["bad", "terrible", "awful", "poor", "slow", "late", "unprofessional", "rude", "dirty", "broken", "waste", "disappointing", "worst", "horrible", "avoid", "scam", "overpriced", "incomplete", "canceled"];

  const positiveCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => lower.includes(w)).length;

  let sentiment;
  if (rating >= 4 || (rating === 3 && positiveCount > negativeCount)) {
    sentiment = "positive";
  } else if (rating <= 2 || negativeCount > positiveCount) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  // Extract meaningful tags from comment
  const tagMap = {
    punctual: ["punctual", "on time", "early", "late"],
    professional: ["professional", "expert", "skilled", "experienced"],
    friendly: ["friendly", "polite", "courteous", "kind"],
    quick: ["quick", "fast", "speedy", "efficient"],
    clean: ["clean", "tidy", "neat"],
    overpriced: ["overpriced", "expensive", "costly", "pricey"],
    poor_quality: ["poor quality", "bad job", "terrible work", "not done properly"],
    communication: ["communicated", "responsive", "called", "replied", "no reply"],
  };

  const tags = [];
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      tags.push(tag);
    }
  }

  return { sentiment, tags };
};

// GET /api/reviews/provider/:providerId — public
router.get("/provider/:providerId", asyncHandler(async (req, res) => {
  const providerId = assertRequiredString(req.params.providerId, "providerId");
  const reviews = await prisma.review.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
  return res.json({ reviews: reviews.map(sanitizeDoc) });
}));

// GET /api/reviews/service/:serviceId — public
router.get("/service/:serviceId", asyncHandler(async (req, res) => {
  const serviceId = assertRequiredString(req.params.serviceId, "serviceId");
  const reviews = await prisma.review.findMany({ where: { serviceId }, orderBy: { createdAt: "desc" } });
  return res.json({ reviews: reviews.map(sanitizeDoc) });
}));

// POST /api/reviews — customer only, requires completed booking
router.post("/", requireAuth, requireRole("customer"), asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const normalizedBookingId = assertRequiredString(bookingId, "bookingId");
  const normalizedComment = assertRequiredString(comment, "comment");

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5");
  }

  // Verify booking belongs to customer and is completed
  const booking = await prisma.booking.findUnique({ where: { id: normalizedBookingId } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.customerId !== req.user.id) throw new ApiError(403, "Forbidden");
  if (booking.status !== "Completed") {
    throw new ApiError(400, "You can only review a completed booking");
  }

  // Prevent duplicate reviews per booking
  const existingReview = await prisma.review.findUnique({ where: { bookingId: normalizedBookingId } });
  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this booking");
  }

  const { sentiment, tags } = analyzeReviewSentiment(rating, normalizedComment);

  const review = await prisma.review.create({
    data: {
      id: createPublicId("r"),
      customerId: req.user.id,
      customerName: req.user.name,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      bookingId: normalizedBookingId,
      rating,
      comment: normalizedComment,
      date: new Date().toISOString().split("T")[0],
      aiSentiment: sentiment,
      aiTags: tags,
    },
  });

  // Update provider's service rating/reviewCount
  const allReviews = await prisma.review.findMany({ where: { serviceId: booking.serviceId } });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await prisma.service.update({
    where: { id: booking.serviceId },
    data: {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    },
  });

  return res.status(201).json({ review: sanitizeDoc(review) });
}));

export default router;
