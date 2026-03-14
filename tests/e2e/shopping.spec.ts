import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env["BASE_URL"] ?? "http://localhost:3000";

class ShoppingPage {
  constructor(private page: Page) {}

  async searchProduct(query: string) {
    await this.page.click("button[aria-label='Search']");
    await this.page.fill('input[type="search"]', query);
    await this.page.press('input[type="search"]', "Enter");
    await this.page.waitForURL(/\/search\?q=/);
  }

  async addFirstProductToCart() {
    const firstCard = this.page.locator(".group.relative").first();
    await firstCard.hover();
    await firstCard.locator("text=কার্টে যোগ করুন").click();
  }

  async goToCart() {
    await this.page.click("a[href='/cart']");
    await this.page.waitForURL(/\/cart/);
  }
}

test.describe("Shopping Flow", () => {
  test("homepage loads and shows hero section", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Unkora/);
    // Hero section
    await expect(page.locator("section").first()).toBeVisible();
    // Category grid
    await expect(page.locator("text=বই")).toBeVisible();
    await expect(page.locator("text=লেদার পণ্য")).toBeVisible();
  });

  test("search in Bangla finds products", async ({ page }) => {
    const shop = new ShoppingPage(page);
    await page.goto(BASE_URL);
    await shop.searchProduct("কুরআন");
    await expect(page.locator("h1, p")).toContainText(/কুরআন|ফলাফল/);
  });

  test("search in English finds products", async ({ page }) => {
    const shop = new ShoppingPage(page);
    await page.goto(BASE_URL);
    await shop.searchProduct("leather wallet");
    await expect(page).toHaveURL(/q=leather\+wallet/);
  });

  test("category page loads with filters", async ({ page }) => {
    await page.goto(`${BASE_URL}/category/books`);
    await expect(page.locator("h1")).toContainText("বই");
    await expect(page.locator("text=ফিল্টার")).toBeVisible();
  });

  test("product detail page loads", async ({ page }) => {
    // Navigate to a product via search
    await page.goto(`${BASE_URL}/products`);
    const firstProduct = page.locator("a.group").first();
    await firstProduct.click();
    // Should navigate to /products/[slug]
    await expect(page).toHaveURL(/\/products\/.+/);
    // Should show add to cart button
    await expect(page.locator("button", { hasText: "কার্টে যোগ করুন" })).toBeVisible();
  });

  test("add to cart increments cart badge", async ({ page }) => {
    await page.goto(BASE_URL);
    // Check initial cart count (0 or absent)
    const cartBadge = page.locator("a[href='/cart'] span");
    const initialCount = await cartBadge.count();

    // Navigate to products and add one
    await page.goto(`${BASE_URL}/products`);
    const firstCard = page.locator("a.group.relative").first();
    await firstCard.hover();
    const addBtn = firstCard.locator("button", { hasText: "কার্টে যোগ করুন" });
    await addBtn.waitFor({ state: "visible", timeout: 3000 });
    await addBtn.click();

    // Toast should appear
    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 3000 });

    // Cart badge should show 1
    await page.goto(BASE_URL);
    await expect(page.locator("a[href='/cart'] span")).toHaveText("1");
  });

  test("cart page shows added items", async ({ page }) => {
    // Pre-fill cart via localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem("unkora-cart", JSON.stringify({
        state: {
          items: [{
            id: "test-1",
            product_id: "prod-1",
            name_en: "Test Book",
            name_bn: "পরীক্ষার বই",
            image: "/placeholder.jpg",
            sku: "BK-001",
            unit_price: 45000,
            quantity: 2,
            stock_quantity: 50,
          }],
          totalItems: 2,
          subtotal: 90000,
          discountAmount: 0,
          couponCode: null,
        },
        version: 0,
      }));
    });

    await page.goto(`${BASE_URL}/cart`);
    await expect(page.locator("text=পরীক্ষার বই")).toBeVisible();
    await expect(page.locator("text=শপিং কার্ট")).toBeVisible();
  });

  test("empty cart shows call to action", async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`);
    await expect(page.locator("text=কার্ট খালি")).toBeVisible();
    await expect(page.locator("a", { hasText: "শপিং শুরু করুন" })).toBeVisible();
  });

  test("filter by price range works", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.click("text=৳০ – ৳৫০০");
    await expect(page).toHaveURL(/min_price=0/);
  });
});
