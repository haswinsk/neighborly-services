import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { getNearbyProviders, formatDistance } from "../utils/distance.js";
import { assertNumber } from "../middleware/validation.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ users: users.map(sanitizeUser) });
}));

router.patch("/:id/approve", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, "User not found");

  const updatedUser = await prisma.user.update({ where: { id: req.params.id }, data: { approved: true } });
  return res.json({ user: sanitizeUser(updatedUser) });
}));

router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, "User not found");

  await prisma.user.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}));

// Update user location
router.put("/:id/location", requireAuth, asyncHandler(async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden");
  }

  const { latitude, longitude, address, city, state, country } = req.body;

  const updateData = {};
  if (latitude !== undefined) updateData.latitude = assertNumber(latitude, "Latitude");
  if (longitude !== undefined) updateData.longitude = assertNumber(longitude, "Longitude");
  if (address !== undefined) updateData.address = address || "";
  if (city !== undefined) updateData.city = city || "";
  if (state !== undefined) updateData.state = state || "";
  if (country !== undefined) updateData.country = country || "India";

  const updatedUser = await prisma.user.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ user: sanitizeUser(updatedUser) });
}));

// Get nearby providers based on customer location
router.get("/nearby-providers", requireAuth, asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 15, category } = req.query;

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const lat = assertNumber(parseFloat(latitude), "Latitude");
  const lon = assertNumber(parseFloat(longitude), "Longitude");
  const radiusKm = assertNumber(parseFloat(radius), "Radius", { min: 1, max: 100 });

  const query = {
    where: {
      role: "provider",
      approved: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      latitude: true,
      longitude: true,
      address: true,
      city: true,
      state: true,
      avatar: true,
      servicesProvided: {
        select: {
          id: true,
          serviceName: true,
          description: true,
          price: true,
          category: true,
          rating: true,
          reviewCount: true,
          image: true,
        },
      },
    },
  };

  if (category) {
    query.where.servicesProvided = {
      some: { category: category },
    };
  }

  const providers = await prisma.user.findMany(query);
  const nearbyProviders = getNearbyProviders(lat, lon, radiusKm, providers);

  return res.json({
    providers: nearbyProviders.map((provider) => ({
      ...provider,
      distance: formatDistance(provider.distance),
    })),
    count: nearbyProviders.length,
    radius: radiusKm,
  });
}));

// Update user profile
router.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden");
  }

  const { name, phone, location, address, city, state, country } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name || req.user.name;
  if (location !== undefined) updateData.location = location || "";
  if (address !== undefined) updateData.address = address || "";
  if (city !== undefined) updateData.city = city || "";
  if (state !== undefined) updateData.state = state || "";
  if (country !== undefined) updateData.country = country || "India";

  // Check phone uniqueness if updating phone
  if (phone !== undefined && phone) {
    const phoneTrim = phone.trim();
    if (phoneTrim && phoneTrim !== req.user.phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone: phoneTrim } });
      if (phoneExists) {
        throw new ApiError(409, "Phone number already in use");
      }
      updateData.phone = phoneTrim;
    }
  }

  const updatedUser = await prisma.user.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ user: sanitizeUser(updatedUser) });
}));

export default router;
