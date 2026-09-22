import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertNumber, assertRequiredString, assertEnum } from "../middleware/validation.js";
import { SERVICE_CATEGORIES } from "../constants/index.js";

const router = express.Router();

const getApprovedProviderIds = async () => {
  const providers = await prisma.user.findMany({ where: { role: "provider", approved: true }, select: { id: true } });
  return providers.map((provider) => provider.id);
};

router.get("/", asyncHandler(async (req, res) => {
  const { q, category, location, city, minPrice, maxPrice, availableOnly, lat, lng, radius } = req.query;

  // Build filter for approved providers
  const approvedProviderIds = await getApprovedProviderIds();

  // Build service filters
  const filters = {
    providerId: { in: approvedProviderIds },
  };

  // Text search
  if (q && typeof q === "string") {
    const searchQuery = q.trim();
    filters.OR = [
      { serviceName: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { category: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (category && typeof category === "string") {
    filters.category = category;
  }

  // Location/city filter (text-based)
  if (city && typeof city === "string") {
    filters.city = { contains: city.trim(), mode: "insensitive" };
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) filters.price.gte = Number(minPrice);
    if (maxPrice !== undefined) filters.price.lte = Number(maxPrice);
  }

  // Active services only (default true for customer discovery)
  const activeOnly = availableOnly !== "false";
  if (activeOnly) {
    filters.isActive = { not: false };
  }

  const services = await prisma.service.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // If coordinates provided, calculate distance and sort by proximity
  let servicesWithDistance = services.map((service) => {
    let distanceKm = null;
    if (lat && lng && service.latitude != null && service.longitude != null) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const r = 6371; // Earth's radius in km
      const dLat = ((service.latitude - userLat) * Math.PI) / 180;
      const dLng = ((service.longitude - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((service.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm = Math.round(r * c * 10) / 10;
    }
    return { ...sanitizeDoc(service), distanceKm };
  });

  // Filter by radius if specified
  if (lat && lng && radius) {
    const maxDist = Number(radius);
    servicesWithDistance = servicesWithDistance.filter((s) => s.distanceKm == null || s.distanceKm <= maxDist);
  }

  // Sort by distance if coordinates provided
  if (lat && lng) {
    servicesWithDistance.sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  return res.json({ services: servicesWithDistance });
}));

router.get("/provider/mine", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const services = await prisma.service.findMany({ where: { providerId: req.user.id }, orderBy: { createdAt: 'desc' } });
  return res.json({ services: services.map(sanitizeDoc) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const provider = await prisma.user.findUnique({ where: { id: service.providerId, role: "provider" }, select: { approved: true } });
  if (!provider || provider.approved !== true) {
    throw new ApiError(404, "Service not found");
  }

  return res.json({ service: sanitizeDoc(service) });
}));

router.post(
  "/",
  requireAuth,
  requireRole("provider"),
  asyncHandler(async (req, res) => {
    const { serviceName, description, price, category, address, city, state, latitude, longitude } = req.body;

    const normalizedServiceName = assertRequiredString(serviceName, "Service name");
    const normalizedDescription = assertRequiredString(description, "Description");
    const normalizedCategory = assertEnum(category, SERVICE_CATEGORIES, "Category");
    const normalizedPrice = assertNumber(price, "Price", { min: 0 });

    const provider = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Use provided lat/lng, or fall back to provider's stored location
    const serviceLat = (typeof latitude === "number" && !isNaN(latitude)) ? latitude : (provider?.latitude ?? null);
    const serviceLng = (typeof longitude === "number" && !isNaN(longitude)) ? longitude : (provider?.longitude ?? null);

    const service = await prisma.service.create({
      data: {
        id: createPublicId("s"),
        serviceName: normalizedServiceName,
        description: normalizedDescription,
        price: normalizedPrice,
        category: normalizedCategory,
        providerId: req.user.id,
        providerName: provider?.name || req.user.name,
        providerLocation: provider?.location || req.user.location,
        address: address || provider?.address || "",
        city: city || provider?.city || "",
        state: state || provider?.state || "",
        latitude: serviceLat,
        longitude: serviceLng,
        rating: 0,
        reviewCount: 0,
      },
    });

    return res.status(201).json({ service: sanitizeDoc(service) });
  })
);

router.put("/:id", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) throw new ApiError(404, "Service not found");
  if (service.providerId !== req.user.id) throw new ApiError(403, "Forbidden");

  const updateData = {};
  if (req.body.serviceName !== undefined) updateData.serviceName = assertRequiredString(req.body.serviceName, "Service name");
  if (req.body.description !== undefined) updateData.description = assertRequiredString(req.body.description, "Description");
  if (req.body.category !== undefined) updateData.category = assertEnum(req.body.category, SERVICE_CATEGORIES, "Category");
  if (req.body.price !== undefined) updateData.price = assertNumber(req.body.price, "Price", { min: 0 });
  if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive);

  const updatedService = await prisma.service.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ service: sanitizeDoc(updatedService) });
}));

router.delete("/:id", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) throw new ApiError(404, "Service not found");
  if (service.providerId !== req.user.id) throw new ApiError(403, "Forbidden");

  await prisma.service.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}));

export default router;
