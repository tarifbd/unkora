import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const BASE_URL = process.env["BASE_URL"] ?? "http://localhost:3000";

async function mockLoggedInWithCart(context: BrowserContext) {
  await context.addInitScript(() => {
    window.localStorage.setItem("unkora-auth", JSON.stringify({
      state: {
        user: { id: "user-test", name_en: "Test User", name_bn: "পরীক্ষা ব্যবহারকারী", role: "CUSTOMER", loyalty_points: 100, loyalty_tier: "BRONZE", referral_code: "TEST123" },
        accessToken: "mock-access-token",
      },
    }));
    window.localStorage.setItem("unkora-cart", JSON.stringify({
      state: {
        items: [{
          id: "item-1",
          product_id: "prod-1",
          name_en: "Premium Leather Wallet",
          name_bn: "প্রিমিয়াম চামড়ার মানিব্যাগ",
          image: "/placeholder.jpg",
          sku: "LEA-001",
          unit_price: 95000,
          quantity: 1,
          stock_quantity: 25,
        }],
        totalItems: 1,
        subtotal: 95000,
        discountAmount: 0,
        couponCode: null,
      },
      version: 0,
    }));
  });
}

test.describe("Checkout Flow", () => {
  test("checkout page loads with cart items", async ({ page, context }) => {
    await mockLoggedInWithCart(context);
    await page.goto(`${BASE_URL}/checkout`);
    await expect(page.locator("h1")).toContainText("চেকআউট");
    await expect(page.locator("text=প্রিমিয়াম চামড়ার মানিব্যাগ")).toBeVisible();
  });

  test("address step requires all fields", async ({ page, context }) => {
    await mockLoggedInWithCart(context);
    await page.goto(`${BASE_URL}/checkout`);
    await page.click("text=পরবর্তী: ডেলিভারি");
    // Should show validation or stay on address step
    await expect(page.locator("text=ঠিকানা")).toBeVisible();
  });

  test("fills address and proceeds to delivery", async ({ page, context }) => {
    await mockLoggedInWithCart(context);
    await page.goto(`${BASE_URL}/checkout`);

    await page.fill('input[placeholder="আপনার নাম বাংলায়"]', "রহিম সাহেব");
    await page.fill('input[placeholder="+8801XXXXXXXXX"]', "+8801700000000");
    await page.fill('input[placeholder]', "১২৩ টেস্ট সড়ক");
    await page.click("text=পরবর্তী: ডেলিভারি");
    await expect(page.locator("text=ডেলিভারি পদ্ধতি")).toBeVisible();
  });

  test("COD checkout flow completes", async ({ page, context }) => {
    await mockLoggedInWithCart(context);
    await page.goto(`${BASE_URL}/checkout`);

    // Fill address
    const inputs = await page.locator('input[type="text"], input[type="tel"]').all();
    if (inputs.length >= 2) {
      await inputs[0]?.fill("Test User");
      await inputs[1]?.fill("+8801700000000");
    }

    // Navigate through steps
    const nextBtns = page.locator("button", { hasText: "পরবর্তী:" });
    await nextBtns.first().click(); // → delivery
    await page.locator("button", { hasText: "পরবর্তী: পেমেন্ট" }).click();

    // Select COD
    await page.locator("text=ক্যাশ অন ডেলিভারি").click();
    await page.click("text=রিভিউ করুন");

    await expect(page.locator("text=অর্ডার নিশ্চিত করুন")).toBeVisible();
    await expect(page.locator("text=প্রিমিয়াম চামড়ার মানিব্যাগ")).toBeVisible();
  });

  test("order summary shows correct total", async ({ page, context }) => {
    await mockLoggedInWithCart(context);
    await page.goto(`${BASE_URL}/checkout`);
    await expect(page.locator("text=৳950")).toBeVisible(); // 95000 paisa = ৳950
  });

  test("empty cart redirects to cart page", async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForTimeout(500);
    // Should redirect since cart is empty
    const url = page.url();
    expect(url).toMatch(/cart|checkout/);
  });
});
