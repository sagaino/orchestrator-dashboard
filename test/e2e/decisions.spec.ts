import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await installLifecycleFixtures(page)
})

test("Decision Inbox orders review work and exposes only enumerated actions", async ({ page }) => {
  await page.goto("/decisions")

  await expect(page.getByRole("heading", { name: "Decision Inbox" })).toBeVisible()
  await expect(page.getByText("Risk ↓ · oldest first", { exact: true })).toBeVisible()
  await expect(page.getByTestId("decision-card")).toHaveCount(3)
  await expect(page.getByTestId("decision-card").nth(0)).toContainText("decision-high-old")
  await expect(page.getByTestId("decision-card").nth(1)).toContainText("decision-high-new")
  await expect(page.getByTestId("decision-card").nth(2)).toContainText("decision-low")
  await expect(page.getByRole("button", { name: "Resolve RETRY for decision-high-old" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Resolve APPROVE for decision-high-old" })).toHaveCount(0)

  await page.getByRole("button", { name: "Resolve RETRY for decision-high-old" }).click()
  await expect(page.getByRole("alertdialog")).toContainText("operator session lokal")
  await page.getByRole("button", { name: "Confirm resolution" }).click()
  await expect(page.getByRole("status")).toContainText("decision-high-old")
  await expect(page.getByTestId("decision-card")).toHaveCount(2)
})
