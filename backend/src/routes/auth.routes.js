import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../config/db.js";
import { createPublicId } from "../utils/id.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { assertEmail, assertEnum, assertRequiredString } from "../middleware/validation.js";
import { USER_ROLES } from "../constants/index.js";

const router = express.Router();

const signToken = (user) => jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, role = "customer", phone = "", location = "" } = req.body;

    const normalizedName = assertRequiredString(name, "Name");
    const normalizedEmail = assertEmail(email);
    const normalizedPassword = assertRequiredString(password, "Password");
    const normalizedRole = assertEnum(role, USER_ROLES, "Role");

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ApiError(409, "Email already exists");
    }

    // Check for duplicate phone if provided
    if (phone && phone.trim()) {
      const phoneTrim = phone.trim();
      const phoneExists = await prisma.user.findUnique({ where: { phone: phoneTrim } });
      if (phoneExists) {
        throw new ApiError(409, "Phone number already registered");
      }
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 10);
    const user = await prisma.user.create({
      data: {
        id: createPublicId(normalizedRole === "provider" ? "p" : normalizedRole === "admin" ? "a" : "c"),
        name: normalizedName,
        email: normalizedEmail,
        password: passwordHash,
        role: normalizedRole,
        phone: typeof phone === "string" ? phone.trim() : "",
        location: typeof location === "string" ? location.trim() : "",
        approved: normalizedRole === "provider" ? false : true,
      },
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const normalizedEmail = assertEmail(email);
    const normalizedPassword = assertRequiredString(password, "Password");

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.role === "provider" && !user.approved) {
      throw new ApiError(403, "Provider account pending admin approval");
    }

    const token = signToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    return res.json({ user: req.user });
  })
);

export default router;
