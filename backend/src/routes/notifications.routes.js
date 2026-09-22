import express from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeDoc } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const router = express.Router();

// GET /api/notifications — returns notifications for the authenticated user
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ notifications: notifications.map(sanitizeDoc) });
}));

// PATCH /api/notifications/:id/read — mark a single notification read
router.patch("/:id/read", requireAuth, asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId !== req.user.id) throw new ApiError(403, "Forbidden");

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  return res.json({ notification: sanitizeDoc(updated) });
}));

// PATCH /api/notifications/read-all — mark all unread notifications read
router.patch("/read-all", requireAuth, asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  return res.json({ message: "All notifications marked as read" });
}));

// DELETE /api/notifications/:id — delete a specific notification
router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId !== req.user.id) throw new ApiError(403, "Forbidden");

  await prisma.notification.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}));

// Helper: create a notification (exported for use by other routes)
export const createNotification = async (userId, title, message, { type = "info", link } = {}) => {
  try {
    await prisma.notification.create({
      data: {
        id: createPublicId("n"),
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });
  } catch {
    // Notification creation failures should not break the main operation
  }
};

export default router;
