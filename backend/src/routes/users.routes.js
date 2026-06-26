import express from "express";
import prisma from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

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

export default router;
