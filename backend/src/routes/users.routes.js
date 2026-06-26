import express from "express";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return res.json({ users: users.map(sanitizeUser) });
}));

router.patch("/:id/approve", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) throw new ApiError(404, "User not found");

  user.approved = true;
  await user.save();

  return res.json({ user: sanitizeUser(user) });
}));

router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) throw new ApiError(404, "User not found");

  await user.deleteOne();
  return res.status(204).send();
}));

export default router;
