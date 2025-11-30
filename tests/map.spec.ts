import { test, expect } from "@playwright/test";

test.describe("Map Application", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto("/");
    // Wait for map to initialize
    await page.waitForSelector(".leaflet-container", {
      state: "visible",
      timeout: 10000,
    });
  });

  test("should load the map and WMS layer", async ({ page }) => {
    // Check if map container is present
    await expect(page.locator(".leaflet-container")).toBeVisible();

    // Check if tiles are loaded (wait for at least one tile)
    await expect(page.locator(".leaflet-tile-pane img").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("should allow searching and flying to a location", async ({ page }) => {
    // Open search view
    await page.click("text=Search for a city, town...");

    // Type in search box
    await page.fill('input[placeholder="city, town, region..."]', "Cologne");

    // Wait for results
    await expect(page.locator("text=Cologne").first()).toBeVisible({
      timeout: 10000,
    });

    // Click on a result type
    await page.click("text=City Proper");

    // Verify we are back to map view or areas defined view
    await expect(
      page.locator("text=Apply outline as base image")
    ).toBeVisible();
  });

  test("should allow drawing a polygon", async ({ page }) => {
    // Click draw polygon button
    await page.click('button[title="Draw Polygon"]');

    // Simulate drawing on the map
    const map = page.locator(".leaflet-container");
    const box = await map.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      await page.mouse.click(x, y);
      await page.mouse.click(x + 100, y);
      await page.mouse.click(x + 100, y + 100);
      await page.mouse.click(x, y); // Close polygon
    }

    // Verify area is added to sidebar
    await expect(page.locator("text=Area").first()).toBeVisible();
  });

  test("should persist areas on reload", async ({ page }) => {
    // Draw a polygon first
    await page.click('button[title="Draw Polygon"]');
    const map = page.locator(".leaflet-container");
    const box = await map.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;

      await page.mouse.click(x, y);
      await page.mouse.click(x + 100, y);
      await page.mouse.click(x + 100, y + 100);
      await page.mouse.click(x, y);
    }

    // Reload page
    await page.reload();

    // Verify area is still there
    await expect(page.locator("text=Area").first()).toBeVisible();
  });
});
