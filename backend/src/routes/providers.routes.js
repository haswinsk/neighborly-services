import express from "express";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const router = express.Router();

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get all providers with optional filtering
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { userLat, userLon, category, maxDistance = 10, sortBy = "distance" } = req.query;

    const approvedProviderIds = await User.find({ role: "provider", approved: true }).select("id");
    const approvedIds = approvedProviderIds.map((p) => p.id);

    let query = { providerId: { $in: approvedIds } };

    if (category) {
      query.category = category;
    }

    const services = await Service.find(query).populate({
      path: "providerId",
      model: "User",
      select: "name phone email location latitude longitude",
    });

    let enrichedServices = services.map((service) => ({
      id: service.id,
      name: service.providerName,
      service: service.serviceName,
      category: service.category,
      latitude: service.providerLatitude,
      longitude: service.providerLongitude,
      rating: service.rating,
      price: service.price,
      availability: service.availability,
      providerId: service.providerId,
      distance: null,
    }));

    // Calculate distances if user location provided
    if (userLat && userLon) {
      enrichedServices = enrichedServices
        .map((s) => ({
          ...s,
          distance: s.latitude && s.longitude ? calculateDistance(parseFloat(userLat), parseFloat(userLon), s.latitude, s.longitude) : null,
        }))
        .filter((s) => s.distance === null || s.distance <= parseFloat(maxDistance));
    }

    // Sort providers
    if (sortBy === "distance" && enrichedServices.some((s) => s.distance !== null)) {
      enrichedServices.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else if (sortBy === "rating") {
      enrichedServices.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price") {
      enrichedServices.sort((a, b) => a.price - b.price);
    }

    return res.json({ providers: enrichedServices });
  })
);

export default router;
