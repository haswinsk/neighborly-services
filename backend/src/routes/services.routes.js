import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertNumber, assertRequiredString } from "../middleware/validation.js";

const router = express.Router();

const getApprovedProviderIds = async () => {
  const providers = await prisma.user.findMany({ where: { role: "provider", approved: true }, select: { id: true } });
  return providers.map((provider) => provider.id);
};

router.get("/", asyncHandler(async (req, res) => {
  const approvedProviderIds = await getApprovedProviderIds();
  const services = await prisma.service.findMany({ where: { providerId: { in: approvedProviderIds } }, orderBy: { createdAt: 'desc' } });
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
    const normalizedCategory = assertRequiredString(category, "Category");
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
  if (req.body.category !== undefined) updateData.category = assertRequiredString(req.body.category, "Category");
  if (req.body.price !== undefined) updateData.price = assertNumber(req.body.price, "Price", { min: 0 });

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
