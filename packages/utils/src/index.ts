import crypto from "crypto";

// ── PRICE UTILITIES ───────────────────────────

/**
 * Format paisa (integer) to BDT display string
 * e.g. 123400 → "৳1,234.00"
 */
export function formatBDT(paisa: number): string {
  const taka = paisa / 100;
  return `৳${taka.toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Compact format for large numbers
 * e.g. 120000 → "৳1.2K"
 */
export function formatBDTCompact(paisa: number): string {
  const taka = paisa / 100;
  if (taka >= 1_000_000) return `৳${(taka / 1_000_000).toFixed(1)}M`;
  if (taka >= 1_000) return `৳${(taka / 1_000).toFixed(1)}K`;
  return `৳${taka.toFixed(0)}`;
}

export function calculateDiscount(originalPaisa: number, salePaisa: number): number {
  if (originalPaisa <= 0) return 0;
  return Math.round(((originalPaisa - salePaisa) / originalPaisa) * 100);
}

export function applyDiscount(pricePaisa: number, percentage: number): number {
  return Math.round(pricePaisa * (1 - percentage / 100));
}

// ── PHONE UTILITIES ───────────────────────────

export function formatBDPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `+88${digits}`;
  }
  if (digits.length === 10) {
    return `+880${digits}`;
  }
  return phone;
}

export function validateBDPhone(phone: string): boolean {
  return /^\+8801[3-9]\d{8}$/.test(phone);
}

export function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 5)}*****${phone.slice(-4)}`;
}

// ── DATE UTILITIES ────────────────────────────

const BD_HOLIDAYS_2024_2025 = [
  "2024-02-21", "2024-03-17", "2024-03-26",
  "2024-04-01", "2024-04-10", "2024-04-11",
  "2024-04-14", "2024-05-01", "2024-08-15",
  "2024-10-12", "2024-10-13", "2024-12-16",
  "2024-12-25", "2025-02-21", "2025-03-17",
  "2025-03-26", "2025-03-30", "2025-03-31",
  "2025-04-01", "2025-04-14", "2025-05-01",
  "2025-08-15", "2025-12-16", "2025-12-25",
];

export function isBangladeshHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split("T")[0]!;
  return BD_HOLIDAYS_2024_2025.includes(dateStr);
}

export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

export function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (!isFriday(result) && !isBangladeshHoliday(result)) {
      added++;
    }
  }
  return result;
}

export function estimateDelivery(
  standardDays: number,
  expressDays: number
): { standard: { min: Date; max: Date }; express: { min: Date; max: Date } } {
  const now = new Date();
  return {
    standard: {
      min: addBusinessDays(now, standardDays),
      max: addBusinessDays(now, standardDays + 1),
    },
    express: {
      min: addBusinessDays(now, expressDays),
      max: addBusinessDays(now, expressDays + 1),
    },
  };
}

export function formatDateBN(date: Date): string {
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateEN(date: Date): string {
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── ORDER UTILITIES ───────────────────────────

const ORDER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += ORDER_CHARS[Math.floor(Math.random() * ORDER_CHARS.length)];
  }
  return `UNK-${dateStr}-${suffix}`;
}

export function generateSKU(category: string, brandCode: string, id: string): string {
  const cat = category.slice(0, 3).toUpperCase();
  const brand = brandCode.slice(0, 3).toUpperCase();
  const uid = id.slice(-6).toUpperCase();
  return `${cat}-${brand}-${uid}`;
}

// ── OTP UTILITIES ─────────────────────────────

export function generateOTP(digits: 4 | 6 = 6): string {
  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);
  const otp = crypto.randomInt(min, max);
  return String(otp).padStart(digits, "0");
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOTP(otp: string, hash: string): boolean {
  const otpHash = hashOTP(otp);
  return crypto.timingSafeEqual(Buffer.from(otpHash), Buffer.from(hash));
}

// ── PAGINATION ────────────────────────────────

export interface ParsedPagination {
  page: number;
  perPage: number;
  skip: number;
  take: number;
}

export function parsePagination(query: {
  page?: string | number;
  per_page?: string | number;
  limit?: string | number;
}): ParsedPagination {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10));
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(String(query.per_page ?? query.limit ?? 20), 10))
  );
  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number
) {
  const totalPages = Math.ceil(total / perPage);
  return {
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}

// ── FILE UTILITIES ────────────────────────────

export function generateS3Key(folder: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "jpg";
  const uid = crypto.randomBytes(16).toString("hex");
  const date = new Date().toISOString().split("T")[0]!.replace(/-/g, "/");
  return `${folder}/${date}/${uid}.${ext}`;
}

export function getCloudFrontUrl(s3Key: string): string {
  const cdnUrl = process.env["AWS_CLOUDFRONT_URL"] ?? "";
  return `${cdnUrl}/${s3Key}`;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = ["application/pdf"];

export function validateFileType(
  mimetype: string,
  type: "image" | "document" | "all" = "image"
): boolean {
  if (type === "image") return ALLOWED_IMAGE_TYPES.includes(mimetype);
  if (type === "document") return ALLOWED_DOC_TYPES.includes(mimetype);
  return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(mimetype);
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

// ── STRING UTILITIES ──────────────────────────

export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function generateSlug(textEn: string, textBn?: string): string {
  const base = textEn || textBn || "";
  return base
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── CRYPTO UTILITIES ──────────────────────────

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function hashSHA256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function hmacSHA256(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

// ── BANGLADESH DISTRICT UTILITIES ────────────

import { BANGLADESH_DISTRICTS, Division } from "@unkora/types";

export function getAllDistricts() {
  return BANGLADESH_DISTRICTS;
}

export function getDistrictsByDivision(division: Division) {
  return BANGLADESH_DISTRICTS.filter((d) => d.division === division);
}

export function getDivisions(): Division[] {
  return Object.values(Division);
}

export function isValidDistrict(name: string): boolean {
  return BANGLADESH_DISTRICTS.some(
    (d) => d.name_en.toLowerCase() === name.toLowerCase() || d.name_bn === name
  );
}

// ── LOGGER FACTORY ────────────────────────────

import winston from "winston";

export function createLogger(service: string): winston.Logger {
  const format =
    process.env["NODE_ENV"] === "production"
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "HH:mm:ss" }),
          winston.format.errors({ stack: true }),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) =>
              `${String(timestamp)} [${service}] ${level}: ${String(message)} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
              }`
          )
        );

  return winston.createLogger({
    level: process.env["LOG_LEVEL"] ?? "info",
    defaultMeta: { service },
    format,
    transports: [new winston.transports.Console()],
  });
}

// ── ERROR UTILITIES ───────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly messageBn?: string;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    messageBn?: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.messageBn = messageBn;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const HttpError = {
  BadRequest: (msg = "Bad request", code = "BAD_REQUEST", msgBn?: string) =>
    new AppError(msg, 400, code, msgBn),
  Unauthorized: (msg = "Unauthorized", code = "UNAUTHORIZED", msgBn?: string) =>
    new AppError(msg, 401, code, msgBn),
  Forbidden: (msg = "Forbidden", code = "FORBIDDEN", msgBn?: string) =>
    new AppError(msg, 403, code, msgBn),
  NotFound: (msg = "Not found", code = "NOT_FOUND", msgBn?: string) =>
    new AppError(msg, 404, code, msgBn),
  Conflict: (msg = "Conflict", code = "CONFLICT", msgBn?: string) =>
    new AppError(msg, 409, code, msgBn),
  TooManyRequests: (msg = "Too many requests", code = "RATE_LIMITED", msgBn?: string) =>
    new AppError(msg, 429, code, msgBn),
  InternalError: (msg = "Internal server error", code = "INTERNAL_ERROR", msgBn?: string) =>
    new AppError(msg, 500, code, msgBn, false),
};

import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      message_bn: err.messageBn,
    });
    return;
  }

  // Prisma errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        success: false,
        code: "ALREADY_EXISTS",
        message: "This value already exists",
        message_bn: "এই মানটি ইতিমধ্যে বিদ্যমান",
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: "Record not found",
        message_bn: "তথ্য পাওয়া যায়নি",
      });
      return;
    }
  }

  // Unknown errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message:
      process.env["NODE_ENV"] === "development"
        ? err.message
        : "Internal server error",
    message_bn: "সার্ভার সমস্যা হয়েছে",
  });
}

export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ── ZOD VALIDATION HELPERS ────────────────────

import { z } from "zod";

export const bdPhone = z
  .string()
  .regex(/^\+8801[3-9]\d{8}$/, "Invalid Bangladesh phone number");

export const bdPostalCode = z
  .string()
  .regex(/^\d{4}$/, "Invalid postal code");

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");

export const bdtAmount = z
  .number()
  .int("Amount must be in paisa (integer)")
  .positive("Amount must be positive");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});
