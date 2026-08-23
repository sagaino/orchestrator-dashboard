import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await installLifecycleFixtures(page)
})

test("Plan Review exposes scope, graph edges, budget, and explicit approval", async ({ page }) => {
  const mutationPaths: string[] = []
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/objectives/e2e-plan-review")) mutationPaths.push(new URL(request.url()).pathname)
  })

  await page.goto("/tasks?objectiveId=e2e-plan-review")
  const dialog = page.getByRole("dialog", { name: "Plan Review" })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText("Review the deterministic multi-node objective plan.")
  await expect(dialog).toContainText("Keep diagnosis read-only before implementation.")
  await expect(dialog).toContainText("N01")
  await expect(dialog).toContainText("N02")
  await expect(dialog).toContainText("Dependencies")
  await expect(dialog).toContainText("None (root node)")
  await expect(dialog).toContainText("Max nodes")
  await expect(dialog).toContainText("Project verification")

  await dialog.getByLabel("Skill assignment N01").selectOption("diagnostic-review@1.0.0")
  await dialog.getByRole("button", { name: "Assign selected skills" }).click()
  await expect(dialog).toContainText("plan-e2e-plan-review-r2")
  await expect(dialog).toContainText("diagnostic-review@1.0.0")

  await dialog.getByRole("button", { name: "Approve Plan" }).click()
  await expect(dialog.getByText("Plan Approved", { exact: true })).toBeVisible()
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/approve-plan")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/plan/skills")
})

test("Plan Review maps revision and cancel actions to separate endpoints", async ({ page }) => {
  const mutationPaths: string[] = []
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/objectives/e2e-plan-review")) mutationPaths.push(new URL(request.url()).pathname)
  })

  await page.goto("/tasks?objectiveId=e2e-plan-review")
  const dialog = page.getByRole("dialog", { name: "Plan Review" })
  await dialog.getByRole("button", { name: "Request Plan Revision" }).click()
  await dialog.getByLabel("Alasan request plan revision").fill("Add explicit verification evidence.")
  await dialog.getByRole("button", { name: "Kirim Request Revision" }).click()
  await expect(dialog).toContainText("plan-e2e-plan-review-r2")

  await dialog.getByRole("button", { name: "Cancel Objective" }).click()
  await expect(page.getByText(/Objective e2e-plan-review dibatalkan/)).toBeVisible()
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/request-plan-changes")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/cancel")
})
