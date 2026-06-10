import { test, expect } from "@playwright/test";

test.describe("Kickoff 2026 Dashboard E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dashboard web page
    await page.goto("/");
  });

  test("should render the header and page titles correctly", async ({ page }) => {
    // Check main title
    await expect(page.locator("text=KICKOFF 2026")).toBeVisible();
    
    // Check navigation tab names (e.g. Dashboard)
    await expect(page.locator("button:has-text('Dashboard')")).toBeVisible();
    await expect(page.locator("button:has-text('Matches')")).toBeVisible();
  });

  test("should allow changing the language setting and translate labels", async ({ page }) => {
    // Select dropdown language element
    const langSelect = page.locator("select");
    await expect(langSelect).toBeVisible();

    // Select Spanish (es)
    await langSelect.selectOption({ value: "es" });

    // Verify translations reflect instantly (e.g. "Dashboard" becomes "Panel")
    await expect(page.locator("button:has-text('Panel')")).toBeVisible();
    await expect(page.locator("button:has-text('Partidos')")).toBeVisible();
  });

  test("should navigate to matches list on tab click", async ({ page }) => {
    // Click on matches tab
    await page.click("button:has-text('Matches')");
    
    // Verify matches list contains headers or indicators
    await expect(page.locator("text=Upcoming Fixtures")).toBeVisible();
  });
});
