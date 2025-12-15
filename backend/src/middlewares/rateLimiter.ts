import dotenv from 'dotenv';
dotenv.config();
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs:
    process.env.NODE_ENV === "production"
      ? 15 * 60 * 1000 // 15 min
      : 1 * 60 * 1000, // 1 min (dev)

  max:
    process.env.NODE_ENV === "production"
      ? 100
      : 1000, // dev-friendly

  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },

  standardHeaders: true,
  legacyHeaders: false,
});
