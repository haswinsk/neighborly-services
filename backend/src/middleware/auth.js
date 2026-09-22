import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../config/db.js";
import { sanitizeUser } from "../utils/sanitize.js";

const getToken = (authHeader = "") => {
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Enforce role-based access control.
 * Does NOT automatically reject unapproved providers.
 * Use requireApprovedProvider() for marketplace visibility actions.
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

/**
 * For provider actions that require marketplace approval:
 * - public service listing
 * - accepting customer jobs
 * - appearing in provider search/recommendations
 * Pending providers can still access onboarding/verification routes.
 */
export const requireApprovedProvider = (req, res, next) => {
  if (!req.user || req.user.role !== "provider") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.user.approved === false) {
    return res.status(403).json({ message: "Provider account pending admin approval" });
  }

  next();
};

