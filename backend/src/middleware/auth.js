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

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.user.role === "provider" && req.user.approved === false) {
    return res.status(403).json({ message: "Provider account pending admin approval" });
  }

  next();
};
