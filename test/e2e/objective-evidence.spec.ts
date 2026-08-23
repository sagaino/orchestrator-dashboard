import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await installLifecycleFixtures(page)
})

test("Objective evidence keeps final acceptance separate from evidence review", async ({ page }) => {
  await page.goto("/objectives/e2e-objective-dashboard")

  await expect(page.getByRole("heading", { name: "Review the deterministic objective evidence dashboard." })).toBeVisible()
  await expect(page.getByText("Node outcomes & evidence")).toBeVisible()
  await expect(page.getByText("Aggregate verification")).toBeVisible()
  await expect(page.getByText("Usage & budget")).toBeVisible()
  await expect(page.getByText("N01 · DIAGNOSTIC")).toBeVisible()
  await expect(page.getByRole("link", { name: "Diff" })).toBeVisible()

  await page.getByRole("button", { name: "Final Acceptance" }).click()
  await expect(page.getByRole("alertdialog")).toContainText("Acceptance akan membuat decision durable")
  await page.getByRole("button", { name: "Accept objective" }).click()
  await expect(page.getByText("ACCEPTED", { exact: true })).toBeVisible()
})
