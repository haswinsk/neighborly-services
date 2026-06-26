import { ApiError } from "../utils/apiError.js";

export const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Not found"));
};

export const errorHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed", details: error.message });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS origin not allowed" });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({
    message,
    ...(error.details ? { details: error.details } : {}),
  });
};
