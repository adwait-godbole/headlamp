import { expect, test } from "@playwright/test";
import { HeadlampPage } from "./headlampPage";

test.describe("multi-cluster setup", () => {
  let headlampPage: HeadlampPage;

  test.beforeEach(async ({ page }) => {
    headlampPage = new HeadlampPage(page);
    await headlampPage.navigateTopage("/", /Choose a cluster/);
    await expect(page.locator('h1:has-text("Home")')).toBeVisible();
  });

  test("home page should have 2 cluster choice buttons", async ({ page }) => {
    const buttons = page.locator("button p");
    await expect(buttons).toHaveCount(2);
    await expect(page.locator("button p", { hasText: /^test$/ })).toBeVisible();
    await expect(
      page.locator("button p", { hasText: /^test2$/ })
    ).toBeVisible();
  });

  test("home page should have a table with correct cluster entries", async ({
    page,
  }) => {
    await expect(page.locator('h2:has-text("All Clusters")')).toBeVisible();

    const tableRows = page.locator("table tbody tr");
    await expect(tableRows).toHaveCount(2);
    await expect(page.locator("th", { hasText: "Name" })).toBeVisible();
    await expect(page.locator("th", { hasText: "Status" })).toBeVisible();

    for (const clusterName of ["test", "test2"]) {
      const clusterAnchor = page.locator("table tbody tr td a", {
        hasText: new RegExp(`^${clusterName}$`),
      });
      await expect(clusterAnchor).toBeVisible();

      const clusterRow = clusterAnchor.locator("../../..");

      const clusterStatus = clusterRow.locator("td").nth(2).locator("p");
      await expect(clusterStatus).toHaveText("Active");
    }
  });

  test("login to 'test' cluster and logout", async ({ page }) => {
    const testClusterAnchor = page.locator("table tbody tr td a", {
      hasText: /^test$/,
    });
    await expect(testClusterAnchor).toBeVisible();
    await expect(testClusterAnchor).toHaveAttribute("href", "/c/test/");

    await headlampPage.authenticate();
    await headlampPage.logout();

    await page.waitForLoadState("load");
    await headlampPage.hasTitleContaining(/Choose a cluster/);
  });

  test("login to 'test2' cluster and logout", async ({ page }) => {
    const test2ClusterAnchor = page.locator("table tbody tr td a", {
      hasText: /^test2$/,
    });
    await expect(test2ClusterAnchor).toBeVisible();
    await expect(test2ClusterAnchor).toHaveAttribute("href", "/c/test2/");

    await headlampPage.authenticate(
      "test2",
      process.env.HEADLAMP_TEST2_TOKEN || ""
    );
    await headlampPage.logout();

    await page.waitForLoadState("load");
    await headlampPage.hasTitleContaining(/Choose a cluster/);
  });
});
