import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env["BASE_URL"] ?? "http://localhost:3000";

class AuthPage {
  constructor(private page: Page) {}

  async navigateToLogin() {
    await this.page.goto(`${BASE_URL}/auth/login`);
    await expect(this.page.locator("h1")).toContainText("Unkora-তে স্বাগতম");
  }

  async enterPhone(phone: string) {
    await this.page.fill('input[type="tel"]', phone);
  }

  async clickSendOtp() {
    await this.page.click("text=OTP পাঠান");
  }

  async enterOtp(otp: string) {
    await this.page.fill('input[type="number"]', otp);
  }

  async clickVerifyOtp() {
    await this.page.click("text=লগইন করুন");
  }
}

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await expect(page).toHaveTitle(/Unkora/);
    await expect(page.locator("h1")).toContainText("Unkora-তে স্বাগতম");
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator("button", { hasText: "OTP পাঠান" })).toBeVisible();
  });

  test("phone validation - invalid number shows error", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.navigateToLogin();
    await auth.enterPhone("01700000000"); // missing +880
    await auth.clickSendOtp();
    await expect(page.locator(".toast, [data-sonner-toast]")).toContainText(/মোবাইল নম্বর/);
  });

  test("phone validation - valid number proceeds to OTP stage", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.navigateToLogin();
    await auth.enterPhone("+8801700000000");
    await auth.clickSendOtp();
    // Should show OTP input (mocked in test env)
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 5000 });
  });

  test("already logged in user is redirected", async ({ page }) => {
    // Set mock auth token
    await page.addInitScript(() => {
      window.localStorage.setItem("unkora-auth", JSON.stringify({
        state: { user: { id: "test", name_en: "Test User", role: "CUSTOMER" }, accessToken: "mock-token" }
      }));
    });
    await page.goto(`${BASE_URL}/auth/login`);
    // Should redirect to home
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });
});
