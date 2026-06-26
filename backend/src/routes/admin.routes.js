import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
import { Service } from "../models/Service.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { env } from "../config/env.js";

const router = express.Router();

router.get("/stats", requireAuth, requireRole("admin"), asyncHandler(async (_req, res) => {
  const [users, services, bookings] = await Promise.all([
    User.find(),
    Service.find(),
    Booking.find().sort({ createdAt: -1 }),
  ]);

  const totalRevenue = bookings.filter((booking) => booking.status === "Completed").reduce((sum, booking) => sum + booking.price, 0);
  const adminCommissionRate = env.adminCommissionRate;
  const adminCommissionTotal = Math.round((totalRevenue * adminCommissionRate) / 100);
  const providerPayoutTotal = totalRevenue - adminCommissionTotal;

  return res.json({
    usersCount: users.length,
    servicesCount: services.length,
    bookingsCount: bookings.length,
    totalRevenue,
    adminCommissionRate,
    adminCommissionTotal,
    providerPayoutTotal,
    recentBookings: bookings.slice(0, 5).map(sanitizeDoc),
  });
}));

export default router;
