import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertEnum, assertRequiredString } from "../middleware/validation.js";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "../constants/index.js";
import { env } from "../config/env.js";

const router = express.Router();

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const where =
    req.user.role === "customer"
      ? { customerId: req.user.id }
      : req.user.role === "provider"
      ? { providerId: req.user.id }
      : {};

  const bookings = await prisma.booking.findMany({ where, orderBy: { createdAt: 'desc' } });

  if (req.user.role === "customer") {
    const providerIds = [...new Set(bookings.map((booking) => booking.providerId))];
    const providers = await prisma.user.findMany({
      where: { id: { in: providerIds }, role: "provider" },
      select: { id: true, phone: true, email: true, location: true, latitude: true, longitude: true, address: true, city: true },
    });
    const providerContactById = new Map(
      providers.map((provider) => [provider.id, provider])
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
        // Provider coordinates always visible to customer so they can see provider on map
        providerLatitude: contact?.latitude ?? undefined,
        providerLongitude: contact?.longitude ?? undefined,
      };
    });

    return res.json({ bookings: enrichedBookings });
  }

  if (req.user.role === "provider") {
    // Enrich provider's bookings with customer location so provider can see customer on map
    const customerIds = [...new Set(bookings.map((booking) => booking.customerId))];
    const customers = await prisma.user.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, latitude: true, longitude: true, address: true, city: true },
    });
    const customerLocationById = new Map(customers.map((c) => [c.id, c]));

    const enrichedBookings = bookings.map((booking) => {
      const loc = customerLocationById.get(booking.customerId);
      return {
        ...sanitizeDoc(booking),
        customerLatitude: loc?.latitude ?? undefined,
        customerLongitude: loc?.longitude ?? undefined,
        customerCity: loc?.city ?? undefined,
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

    const service = await prisma.service.findUnique({ where: { id: normalizedServiceId } });
    if (!service) {
      throw new ApiError(404, "Service not found");
    }

    const provider = await prisma.user.findUnique({ where: { id: service.providerId, role: "provider" }, select: { approved: true } });
    if (!provider || provider.approved !== true) {
      throw new ApiError(400, "Service provider is not approved");
    }

    const customer = await prisma.user.findUnique({ where: { id: req.user.id } });

    const booking = await prisma.booking.create({
      data: {
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
      },
    });

    return res.status(201).json({ booking: sanitizeDoc(booking) });
  })
);

router.patch("/:id/status", requireAuth, asyncHandler(async (req, res) => {
  const status = assertEnum(req.body.status, BOOKING_STATUSES, "status");

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (req.user.role === "customer") {
    if (booking.customerId !== req.user.id) {
      throw new ApiError(403, "Forbidden");
    }

    // Customers can only change status from CompletionRequested to Completed
    if (status !== "Completed") {
      throw new ApiError(400, "Customers can only mark booking as completed");
    }

    if (booking.status !== "CompletionRequested") {
      throw new ApiError(400, "Booking must be in CompletionRequested status to be marked as completed");
    }
  } else if (req.user.role === "provider") {
    if (booking.providerId !== req.user.id) {
      throw new ApiError(403, "Forbidden");
    }

    // Provider status transition validation
    const validTransitions = {
      "Requested": ["Accepted", "Rejected"],
      "Accepted": ["In Progress"],
      "In Progress": ["CompletionRequested"],
      "CompletionRequested": [],
      "Completed": [],
      "Rejected": [],
    };

    const allowedStatuses = validTransitions[booking.status];
    if (!allowedStatuses || !allowedStatuses.includes(status)) {
      throw new ApiError(400, `Cannot change status from "${booking.status}" to "${status}"`);
    }
  } else if (req.user.role === "admin") {
    // Admin can change to any status
  } else {
    throw new ApiError(403, "Forbidden");
  }

  const updatedBooking = await prisma.booking.update({ where: { id: req.params.id }, data: { status } });
  return res.json({ booking: sanitizeDoc(updatedBooking) });
}));

router.patch("/:id/payment-status", requireAuth, requireRole("customer"), asyncHandler(async (req, res) => {
  const paymentStatus = assertEnum(req.body.paymentStatus, PAYMENT_STATUSES, "paymentStatus");

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.customerId !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }

  if (paymentStatus !== "Completed") {
    throw new ApiError(400, "Customers can only mark payment as completed");
  }

  if (booking.status !== "CompletionRequested") {
    throw new ApiError(400, "Provider must request completion before payment");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: req.params.id },
    data: {
      paymentStatus: "Completed",
      status: "Completed",
    },
  });
  const provider = await prisma.user.findUnique({ where: { id: booking.providerId, role: "provider" }, select: { phone: true, email: true, location: true } });
  return res.json({
    booking: {
      ...sanitizeDoc(updatedBooking),
      providerPhone: provider?.phone,
      providerEmail: provider?.email,
      providerLocation: provider?.location,
    },
  });
}));

router.get("/earnings/summary", requireAuth, requireRole("provider"), asyncHandler(async (req, res) => {
  const completedBookings = await prisma.booking.findMany({ where: { providerId: req.user.id, status: "Completed" } });

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

export default router;
