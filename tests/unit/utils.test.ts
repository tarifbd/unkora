import { describe, it, expect } from "vitest";
import {
  formatBDT,
  formatBDTCompact,
  calculateDiscount,
  applyDiscount,
  formatBDPhone,
  validateBDPhone,
  maskPhone,
  generateOTP,
  parsePagination,
  buildPaginationMeta,
  generateOrderNumber,
  generateSlug,
  truncate,
  isFriday,
  addBusinessDays,
} from "../packages/utils/src/index";

describe("Price utilities", () => {
  it("formats paisa to BDT string", () => {
    expect(formatBDT(100000)).toContain("১,০০০");
    expect(formatBDT(50000)).toContain("৫০০");
    expect(formatBDT(0)).toContain("০");
  });

  it("formats large amounts compactly", () => {
    const result = formatBDTCompact(10000000); // 1 lakh
    expect(result).toMatch(/লাখ|১/);
  });

  it("calculates discount percentage correctly", () => {
    expect(calculateDiscount(100000, 80000)).toBe(20);
    expect(calculateDiscount(100000, 100000)).toBe(0);
    expect(calculateDiscount(0, 0)).toBe(0);
  });

  it("applies percentage discount", () => {
    expect(applyDiscount(100000, 20)).toBe(80000);
    expect(applyDiscount(100000, 0)).toBe(100000);
    expect(applyDiscount(100000, 100)).toBe(0);
  });
});

describe("Phone utilities", () => {
  it("formats various BD phone formats to E.164", () => {
    expect(formatBDPhone("01700000000")).toBe("+8801700000000");
    expect(formatBDPhone("8801700000000")).toBe("+8801700000000");
    expect(formatBDPhone("+8801700000000")).toBe("+8801700000000");
  });

  it("validates BD phone numbers", () => {
    expect(validateBDPhone("+8801700000000")).toBe(true);
    expect(validateBDPhone("+8801300000000")).toBe(true);
    expect(validateBDPhone("+8801200000000")).toBe(false); // 012 not valid
    expect(validateBDPhone("01700000000")).toBe(false);    // missing +880
    expect(validateBDPhone("+1234567890")).toBe(false);
  });

  it("masks phone number for privacy", () => {
    const masked = maskPhone("+8801700000000");
    expect(masked).toMatch(/^\+8801\*+\d{3}$/);
    expect(masked).not.toContain("1700");
  });
});

describe("OTP utilities", () => {
  it("generates 6-digit OTP", () => {
    const otp = generateOTP(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it("generates 4-digit OTP", () => {
    const otp = generateOTP(4);
    expect(otp).toHaveLength(4);
    expect(/^\d{4}$/.test(otp)).toBe(true);
  });

  it("OTPs are sufficiently random", () => {
    const otps = new Set(Array.from({ length: 100 }, () => generateOTP(6)));
    expect(otps.size).toBeGreaterThan(80); // at least 80% unique
  });
});

describe("Pagination utilities", () => {
  it("parses pagination defaults", () => {
    const p = parsePagination({});
    expect(p.page).toBe(1);
    expect(p.perPage).toBe(20);
    expect(p.skip).toBe(0);
    expect(p.take).toBe(20);
  });

  it("calculates correct skip for page 3", () => {
    const p = parsePagination({ page: 3, per_page: 10 });
    expect(p.skip).toBe(20);
    expect(p.take).toBe(10);
  });

  it("caps per_page at 100", () => {
    const p = parsePagination({ per_page: 500 });
    expect(p.perPage).toBe(100);
  });

  it("builds pagination meta correctly", () => {
    const meta = buildPaginationMeta(105, 3, 10);
    expect(meta.total).toBe(105);
    expect(meta.total_pages).toBe(11);
    expect(meta.has_next).toBe(true);
    expect(meta.has_prev).toBe(true);
  });

  it("first page has no prev", () => {
    const meta = buildPaginationMeta(50, 1, 10);
    expect(meta.has_prev).toBe(false);
    expect(meta.has_next).toBe(true);
  });

  it("last page has no next", () => {
    const meta = buildPaginationMeta(50, 5, 10);
    expect(meta.has_next).toBe(false);
    expect(meta.has_prev).toBe(true);
  });
});

describe("Order number generation", () => {
  it("generates correct format", () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^UNK-\d{8}-[A-Z0-9]{6}$/);
  });

  it("generates unique numbers", () => {
    const nums = new Set(Array.from({ length: 1000 }, generateOrderNumber));
    expect(nums.size).toBeGreaterThan(990);
  });
});

describe("Slug generation", () => {
  it("generates clean slugs", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
    expect(generateSlug("Riyazus Saliheen")).toBe("riyazus-saliheen");
    expect(generateSlug("Product #1 (New)")).toBe("product-1-new");
  });

  it("handles edge cases", () => {
    expect(generateSlug("")).toBe("");
    expect(generateSlug("   spaces   ")).toBe("spaces");
    expect(generateSlug("---dashes---")).toBe("dashes");
  });
});

describe("String utilities", () => {
  it("truncates long text", () => {
    const text = "এটি একটি দীর্ঘ পাঠ্য যা ছোট করতে হবে";
    const truncated = truncate(text, 20);
    expect(truncated.length).toBeLessThanOrEqual(20);
    expect(truncated).toMatch(/…$/);
  });

  it("does not truncate short text", () => {
    const text = "ছোট";
    expect(truncate(text, 100)).toBe(text);
  });
});

describe("Bangladesh date utilities", () => {
  it("identifies Fridays correctly", () => {
    const friday = new Date("2025-01-03"); // A Friday
    const saturday = new Date("2025-01-04");
    expect(isFriday(friday)).toBe(true);
    expect(isFriday(saturday)).toBe(false);
  });

  it("skips Fridays when adding business days", () => {
    const thursday = new Date("2025-01-02"); // Thursday
    const result = addBusinessDays(thursday, 1);
    // Next business day is Saturday (skips Friday)
    expect(result.getDay()).not.toBe(5); // not Friday
  });
});
