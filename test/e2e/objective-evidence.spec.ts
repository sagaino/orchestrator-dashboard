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
  await expect(page.getByRole("heading", { name: "Objective graph" })).toBeVisible()
  await expect(page.getByText("Dependency edges", { exact: true })).toBeVisible()
  await expect(page.getByText("N01 · DIAGNOSTIC").first()).toBeVisible()
  await expect(page.getByRole("link", { name: "Diff" })).toBeVisible()

  await page.getByRole("button", { name: "Aggregate preview" }).click()
  await expect(page.getByText("Aggregate project preview")).toBeVisible()
  await expect(page.getByRole("link", { name: /http:\/\/127\.0\.0\.1:5310/ })).toBeVisible()
  await expect(page.getByText("Preview unavailable tidak dihitung sebagai verification failure.")).toBeVisible()
  await page.getByRole("button", { name: "Stop preview" }).click()
  await expect(page.getByRole("button", { name: "Stop preview" })).toHaveCount(0)

  await expect(page.getByRole("heading", { name: "Objective visual & E2E evidence" })).toBeVisible()
  await expect(page.getByText("/dashboard", { exact: true })).toBeVisible()
  await expect(page.getByText("desktop · 1440×900", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Request changes" }).click()
  await page.getByLabel("Alasan request changes").fill("Perbaiki layout dashboard pada viewport desktop")
  await page.getByRole("button", { name: "Approve repair" }).click()
  await expect(page.getByText("Repair path disetujui dan revision lifecycle sudah dimulai.")).toBeVisible()

  const graphNode = page.getByRole("button", { name: /N01.*DIAGNOSTIC/ })
  await graphNode.focus()
  await graphNode.press("Enter")
  await expect(page.getByText("Selected node", { exact: true })).toBeVisible()
  await expect(page.getByText("Inspect fixture", { exact: true }).last()).toBeVisible()
  await page.reload()
  await expect(page.getByRole("heading", { name: "Objective graph" })).toBeVisible()
  await expect(page.getByRole("button", { name: /N01.*DIAGNOSTIC/ })).toHaveCount(1)

  await page.getByRole("button", { name: "Final Acceptance" }).click()
  await expect(page.getByRole("alertdialog")).toContainText("Acceptance akan membuat decision durable")
  await page.getByRole("button", { name: "Accept objective" }).click()
  await expect(page.getByText("ACCEPTED", { exact: true })).toBeVisible()

  await expect(page.getByRole("heading", { name: "Delivery certification" })).toBeVisible()
  await page.getByRole("button", { name: "Run delivery certification" }).click()
  await expect(page.getByText("HUMAN GATE REQUIRED", { exact: true })).toBeVisible()
  await expect(page.getByText("8 / 8 PASS", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Accept delivery certification" }).click()
  await page.getByRole("button", { name: "Accept certification" }).click()
  await expect(page.getByText("CERTIFIED", { exact: true })).toBeVisible()
})

test("Cross-project result review identifies repositories, checks, blockers, and final action", async ({ page }) => {
  await page.goto("/objectives/e2e-cross-project-review")

  await expect(page.getByRole("heading", { name: "Diagnose and verify the frontend/backend contract incident." })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Cross-project result review" })).toBeVisible()
  await expect(page.getByText("READY — diagnosis and cross-project checks passed")).toBeVisible()
  await expect(page.getByText("2 inspected · 2 changed")).toBeVisible()
  await expect(page.getByText("e2e-project", { exact: true })).toBeVisible()
  await expect(page.getByText("e2e-backend", { exact: true })).toBeVisible()
  await expect(page.getByText("Baseline", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("run-cross-frontend-change", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("run-cross-backend-change", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Contract / API", { exact: true })).toBeVisible()
  await expect(page.getByText("E2E / browser", { exact: true })).toBeVisible()
  await expect(page.getByText("No blockers. Final objective action is available from the page header.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Final Acceptance" })).toBeEnabled()
})
