import express from "express";
import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertEnum, assertRequiredString } from "../middleware/validation.js";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "../constants/index.js";
import { env } from "../config/env.js";

const router = express.Router();

router.get("/earnings/summary", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const completedBookings = await Booking.find({ providerId: req.user.id, status: "Completed" });

  const grossEarnings = completedBookings.reduce((sum, booking) => sum + booking.price, 0);
  const adminCommissionRate = env.adminCommissionRate;
  const adminCommissionTotal = Math.round((grossEarnings * adminCommissionRate) / 100);
  const netEarnings = grossEarnings - adminCommissionTotal;

  return res.json({
    grossEarnings,
    adminCommissionRate,
    adminCommissionTotal,
    netEarnings,
    completedJobsCount: completedBookings.length,
  });
}));

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const query =
    req.user.role === "customer"
      ? { customerId: req.user.id }
      : req.user.role === "provider"
      ? { providerId: req.user.id }
      : {};

  const bookings = await Booking.find(query).sort({ createdAt: -1 });

  if (req.user.role === "customer") {
    const providerIds = [...new Set(bookings.map((booking) => booking.providerId))];
    const providers = await User.find({ id: { $in: providerIds }, role: "provider" }).select("id phone email location");
    const providerContactById = new Map(
      providers.map((provider) => [provider.id, { phone: provider.phone, email: provider.email, location: provider.location }])
    );

    const enrichedBookings = bookings.map((booking) => {
      const sanitizedBooking = sanitizeDoc(booking);
      const contact = providerContactById.get(booking.providerId);
      const shouldExposeContact = booking.paymentStatus === "Completed";

      return {
        ...sanitizedBooking,
        providerPhone: shouldExposeContact ? contact?.phone : undefined,
        providerEmail: shouldExposeContact ? contact?.email : undefined,
        providerLocation: shouldExposeContact ? contact?.location : undefined,
      };
    });

    return res.json({ bookings: enrichedBookings });
  }

  return res.json({ bookings: bookings.map(sanitizeDoc) });
}));

router.post(
  "/",
  requireAuth,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const { serviceId, bookingDate } = req.body;

    const normalizedServiceId = assertRequiredString(serviceId, "serviceId");
    const normalizedBookingDate = assertRequiredString(bookingDate, "bookingDate");

    const service = await Service.findOne({ id: normalizedServiceId });
    if (!service) {
      throw new ApiError(404, "Service not found");
    }

    const provider = await User.findOne({ id: service.providerId, role: "provider" }).select("approved");
    if (!provider || provider.approved !== true) {
      throw new ApiError(400, "Service provider is not approved");
    }

    const customer = await User.findOne({ id: req.user.id });

    const booking = await Booking.create({
      id: createPublicId("b"),
      customerId: req.user.id,
      customerName: customer?.name || req.user.name,
      providerId: service.providerId,
      providerName: service.providerName,
      serviceId: service.id,
      serviceName: service.serviceName,
      bookingDate: normalizedBookingDate,
      status: "Requested",
      paymentStatus: "Pending",
      price: service.price,
    });

    return res.status(201).json({ booking: sanitizeDoc(booking) });
  })
);

router.patch("/:id/status", requireAuth, asyncHandler(async (req, res) => {
  const status = assertEnum(req.body.status, BOOKING_STATUSES, "status");

  const booking = await Booking.findOne({ id: req.params.id });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (req.user.role === "customer") {
    if (booking.customerId !== req.user.id) {
      throw new ApiError(403, "Forbidden");
    }

    if (status !== "Completed") {
      throw new ApiError(400, "Customers can only confirm completion");
    }

    const canConfirm = booking.status === "Accepted" || booking.status === "In Progress";
    if (!canConfirm) {
      throw new ApiError(400, "Booking cannot be marked as completed in current state");
    }
  } else {
    const canEdit = req.user.role === "admin" || (req.user.role === "provider" && booking.providerId === req.user.id);
    if (!canEdit) throw new ApiError(403, "Forbidden");
  }

  booking.status = status;
  await booking.save();

  return res.json({ booking: sanitizeDoc(booking) });
}));

router.patch("/:id/payment-status", requireAuth, requireRole("customer"), asyncHandler(async (req, res) => {
  const paymentStatus = assertEnum(req.body.paymentStatus, PAYMENT_STATUSES, "paymentStatus");

  const booking = await Booking.findOne({ id: req.params.id });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.customerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  if (paymentStatus !== "Completed") {
    throw new ApiError(400, "Customers can only mark payment as completed");
  }

  if (booking.status !== "Completed") {
    throw new ApiError(400, "Complete the service before completing payment");
  }

  booking.paymentStatus = "Completed";
  await booking.save();

  const provider = await User.findOne({ id: booking.providerId, role: "provider" }).select("phone email location");
  return res.json({
    booking: {
      ...sanitizeDoc(booking),
      providerPhone: provider?.phone,
      providerEmail: provider?.email,
      providerLocation: provider?.location,
    },
  });
}));

export default router;
