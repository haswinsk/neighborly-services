import express from "express";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertNumber, assertRequiredString } from "../middleware/validation.js";

const router = express.Router();

const getApprovedProviderIds = async () => {
  const providers = await User.find({ role: "provider", approved: true }).select("id -_id");
  return providers.map((provider) => provider.id);
};

router.get("/", asyncHandler(async (req, res) => {
  const approvedProviderIds = await getApprovedProviderIds();
  const services = await Service.find({ providerId: { $in: approvedProviderIds } }).sort({ createdAt: -1 });
  return res.json({ services: services.map(sanitizeDoc) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const service = await Service.findOne({ id: req.params.id });
  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const provider = await User.findOne({ id: service.providerId, role: "provider" }).select("approved");
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
    const { serviceName, description, price, category } = req.body;

    const normalizedServiceName = assertRequiredString(serviceName, "Service name");
    const normalizedDescription = assertRequiredString(description, "Description");
    const normalizedCategory = assertRequiredString(category, "Category");
    const normalizedPrice = assertNumber(price, "Price", { min: 0 });

    const provider = await User.findOne({ id: req.user.id });
    const service = await Service.create({
      id: createPublicId("s"),
      serviceName: normalizedServiceName,
      description: normalizedDescription,
      price: normalizedPrice,
      category: normalizedCategory,
      providerId: req.user.id,
      providerName: provider?.name || req.user.name,
      providerLocation: provider?.location || req.user.location,
      rating: 0,
      reviewCount: 0,
    });

    return res.status(201).json({ service: sanitizeDoc(service) });
  })
);

router.put("/:id", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const service = await Service.findOne({ id: req.params.id });
  if (!service) throw new ApiError(404, "Service not found");
  if (service.providerId !== req.user.id) throw new ApiError(403, "Forbidden");

  if (req.body.serviceName !== undefined) service.serviceName = assertRequiredString(req.body.serviceName, "Service name");
  if (req.body.description !== undefined) service.description = assertRequiredString(req.body.description, "Description");
  if (req.body.category !== undefined) service.category = assertRequiredString(req.body.category, "Category");
  if (req.body.price !== undefined) service.price = assertNumber(req.body.price, "Price", { min: 0 });

  await service.save();
  return res.json({ service: sanitizeDoc(service) });
}));

router.delete("/:id", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const service = await Service.findOne({ id: req.params.id });
  if (!service) throw new ApiError(404, "Service not found");
  if (service.providerId !== req.user.id) throw new ApiError(403, "Forbidden");

  await service.deleteOne();
  return res.status(204).send();
}));

export default router;
