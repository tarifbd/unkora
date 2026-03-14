import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { errorHandler } from "@unkora/utils";
import authRoutes from "./routes/auth.routes";

const app = express();

app.set("trust proxy", 1);

// Security
app.use(helmet());
app.use(cors({
  origin: (process.env["ALLOWED_ORIGINS"] ?? "http://localhost:3000").split(","),
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (process.env["NODE_ENV"] !== "test") {
  app.use(morgan(process.env["NODE_ENV"] === "production" ? "combined" : "dev"));
}

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: "RATE_LIMITED", message: "Too many requests" },
}));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, code: "NOT_FOUND", message: "Endpoint not found" });
});

// Error handler
app.use(errorHandler);

export default app;
