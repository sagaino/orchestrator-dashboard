import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"
import { collectUnexpectedBrowserErrors } from "./browser-errors"

let browserErrors: string[] = []

test.beforeEach(async ({ page }) => {
  browserErrors = collectUnexpectedBrowserErrors(page)
  await installLifecycleFixtures(page)
})

test.afterEach(async () => {
  expect(browserErrors, "browser console and page errors").toEqual([])
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
  await expect(dialog.getByTestId("plan-governance-evidence")).toContainText("READY")
  await expect(dialog.getByTestId("plan-governance-evidence")).toContainText("RESOLVED_WITH_WAIVERS")
  await expect(dialog.getByTestId("plan-governance-evidence")).toContainText("Waived e2e-project: E2E")

  await dialog.getByLabel("Skill assignment N01").selectOption("diagnostic-review@1.0.0")
  await dialog.getByRole("button", { name: "Assign selected skills" }).click()
  await expect(dialog).toContainText("plan-e2e-plan-review-r2")
  await expect(dialog).toContainText("diagnostic-review@1.0.0")

  await dialog.getByRole("button", { name: "Approve & Run" }).click()
  await expect(page).toHaveURL(/\/objectives\/e2e-plan-review$/)
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/approve-plan")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/materialize")
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

test("Objective Detail can reopen and approve a pending plan after refresh", async ({ page }) => {
  const mutationPaths: string[] = []
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/objectives/e2e-plan-review")) mutationPaths.push(new URL(request.url()).pathname)
  })

  await page.goto("/objectives/e2e-plan-review")
  await expect(page.getByRole("heading", { name: "Review the deterministic multi-node objective plan." })).toBeVisible()
  await expect(page.getByText("Confirm that long objective instructions remain readable")).toBeVisible()
  await page.getByRole("button", { name: "Lihat instruksi lengkap" }).click()
  await expect(page.getByRole("button", { name: "Sembunyikan instruksi" })).toBeVisible()
  await expect(page.getByText("Execution belum dimulai")).toBeVisible()

  await page.getByRole("button", { name: "Review / Approve Plan" }).click()
  const dialog = page.getByRole("dialog", { name: "Plan Review" })
  await expect(dialog).toContainText("plan-e2e-plan-review-r1")
  await expect(dialog).toContainText("N01 · e2e-project")
  await expect(dialog).toContainText("Read-only")
  await expect(dialog).toContainText("Project: typecheck")
  await expect(dialog.getByTestId("plan-governance-evidence")).toContainText("READY")

  const dialogBox = await dialog.boundingBox()
  const closeBox = await dialog.getByRole("button", { name: "Tutup" }).boundingBox()
  const approveBox = await dialog.getByRole("button", { name: "Approve & Run" }).boundingBox()
  const titleBox = await dialog.getByRole("heading", { name: "Plan Review" }).boundingBox()
  expect(dialogBox).not.toBeNull()
  expect(closeBox).not.toBeNull()
  expect(approveBox).not.toBeNull()
  expect(titleBox).not.toBeNull()
  expect(closeBox!.x).toBeGreaterThan(dialogBox!.x + dialogBox!.width * 0.6)
  expect(approveBox!.x + approveBox!.width).toBeGreaterThan(dialogBox!.x + dialogBox!.width * 0.65)
  expect(dialogBox!.y + dialogBox!.height - approveBox!.y - approveBox!.height).toBeGreaterThanOrEqual(14)
  expect(titleBox!.y - dialogBox!.y).toBeGreaterThanOrEqual(18)

  await dialog.getByRole("button", { name: "Approve & Run" }).click()
  await expect(dialog).toHaveCount(0)
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/approve-plan")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/materialize")
})

test("Governance blockers disable approval in task intake and Objective Detail", async ({ page }) => {
  await page.goto("/tasks?objectiveId=e2e-governance-blocked")
  let dialog = page.getByRole("dialog", { name: "Plan Review" })
  await expect(dialog.getByTestId("plan-governance-evidence")).toContainText("BLOCKED")
  await expect(dialog).toContainText("VERIFICATION_INTENT_UNRESOLVED")
  await expect(dialog.getByRole("button", { name: "Approval blocked" })).toBeDisabled()

  await page.goto("/objectives/e2e-governance-blocked")
  await page.getByRole("button", { name: "Review / Approve Plan" }).click()
  dialog = page.getByRole("dialog", { name: "Plan Review" })
  await expect(dialog.getByTestId("plan-governance-evidence")).toContainText("BLOCKED")
  await expect(dialog.getByRole("button", { name: "Approval blocked" })).toBeDisabled()
})
