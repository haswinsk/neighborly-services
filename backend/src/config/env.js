import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || "postgresql://127.0.0.1:5432/neighborly_services",
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminCommissionRate: parseNumber(process.env.ADMIN_COMMISSION_RATE, 10),
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 200),
  authRateLimitMax: parseNumber(process.env.AUTH_RATE_LIMIT_MAX, 30),
};

env.isProduction = env.nodeEnv === "production";

if (env.isProduction) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in production");
  }

  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is required in production");
  }

  if (!process.env.JWT_SECRET || env.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
}
