import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"
import { collectUnexpectedBrowserErrors } from "./browser-errors"

let browserErrors: string[] = []

test.beforeEach(async ({ page }) => {
  browserErrors = []
  browserErrors = collectUnexpectedBrowserErrors(page)
  await installLifecycleFixtures(page)
})

test.afterEach(async () => {
  expect(browserErrors, "browser console and page errors").toEqual([])
})

test("Existing Project intake creates an objective plan before explicit execution approval", async ({ page }) => {
  const mutationPaths: string[] = []
  page.on("request", (request) => {
    if (request.method() === "POST") mutationPaths.push(new URL(request.url()).pathname)
  })
  await page.goto("/tasks")
  await page.getByRole("combobox").selectOption("e2e-project")
  await page.getByRole("textbox", { name: "Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..." }).fill("Create deterministic fixture")
  await page.getByRole("button", { name: "Generate Objective Plan" }).click()

  const dialog = page.getByRole("dialog", { name: "Plan Review" })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText("Review the deterministic multi-node objective plan.")
  await expect(dialog).toContainText("N01")
  await expect(dialog).toContainText("N02")
  await expect(dialog).toContainText("typecheck")

  await dialog.getByRole("button", { name: "Approve & Run" }).click()
  await expect(page).toHaveURL(/\/objectives\/e2e-plan-review$/)
  expect(mutationPaths).toContain("/api/objectives")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/generate-plan")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/approve-plan")
  expect(mutationPaths).toContain("/api/objectives/e2e-plan-review/materialize")
  expect(mutationPaths).not.toContain("/api/tasks/request")
})

test("Overview routes new work to the canonical Objective intake", async ({ page }) => {
  const legacyRequests: string[] = []
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === "/api/tasks/request") legacyRequests.push(request.url())
  })

  await page.goto("/")
  await page.getByRole("combobox").selectOption("e2e-project")
  await page.getByRole("textbox", { name: "Natural Language Prompt" }).fill("Open the canonical objective intake")
  await page.getByRole("button", { name: "Buka Task Intake" }).click()

  await expect(page).toHaveURL(/\/tasks\?projectId=e2e-project&prompt=/)
  await expect(page.getByRole("textbox", { name: "Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..." })).toHaveValue("Open the canonical objective intake")
  expect(legacyRequests).toEqual([])
})

test("review evidence can be accepted through explicit confirmation", async ({ page }) => {
  await page.goto("/runs")
  await page.getByPlaceholder("Cari Run ID, Task, atau Project...").fill("E2E-ACCEPT")
  await page.getByRole("button", { name: /E2E-ACCEPT.*RETROSPECTIVE/ }).click()

  await expect(page.getByRole("status", { name: "Authoritative next action" })).toContainText("Review perubahan")
  await expect(page.getByText("2/2 Passed")).toBeVisible()
  await page.getByRole("button", { name: "Accept & Sync Wiki" }).click()
  const dialog = page.getByRole("alertdialog", { name: "Accept & Sinkronisasi Wiki" })
  await expect(dialog).toContainText("diaplikasikan ke branch utama")
  await expect(dialog.getByRole("checkbox")).not.toBeChecked()
  await dialog.getByRole("button", { name: "Setujui Saja" }).click()
  await expect(page.getByText("DONE", { exact: true }).last()).toBeVisible()
})

test("review supports request changes and rejection workflows", async ({ page }) => {
  await page.goto("/runs")
  const search = page.getByPlaceholder("Cari Run ID, Task, atau Project...")

  await search.fill("E2E-CHANGES")
  await page.getByRole("button", { name: /E2E-CHANGES.*REVIEW/ }).click()
  await page.getByRole("button", { name: "Request Changes" }).click()
  const revisionDialog = page.getByRole("dialog", { name: "Request Changes (Revisi Agent)" })
  await revisionDialog.getByPlaceholder("Tuliskan poin-poin yang perlu direvisi...").fill("Keep the fixture deterministic")
  await revisionDialog.getByRole("button", { name: "Kirim Revisi" }).click()
  await expect(page.getByText("CHANGES_REQUESTED", { exact: true }).last()).toBeVisible()

  await search.fill("E2E-REJECT")
  await page.getByRole("button", { name: /E2E-REJECT.*RETROSPECTIVE/ }).click()
  await page.getByRole("button", { name: "Reject", exact: true }).click()
  const rejectDialog = page.getByRole("dialog", { name: "Tolak Run" })
  await rejectDialog.getByRole("textbox").fill("Fixture rejection is intentional")
  await rejectDialog.getByRole("button", { name: "Tolak Run" }).click()
  await expect(page.getByText("FAILED", { exact: true }).last()).toBeVisible()
})

test("verification failure and restart reconciliation remain explicit", async ({ page }) => {
  await page.goto("/runs")
  const search = page.getByPlaceholder("Cari Run ID, Task, atau Project...")

  await search.fill("E2E-VERIFY-FAIL")
  await page.getByRole("button", { name: /E2E-VERIFY-FAIL.*FAILED/ }).click()
  await expect(page.getByText("EXIT 1 (FAIL)")).toBeVisible()
  await expect(page.getByRole("status", { name: "Authoritative next action" })).toContainText("verification failure")

  await search.fill("E2E-RESTART")
  await page.getByRole("button", { name: /E2E-RESTART.*FAILED/ }).click()
  await expect(page.getByText("Restart Reconciliation", { exact: true })).toBeVisible()
  await expect(page.getByText("MANUAL_RECOVERY_REQUIRED", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("RESTART_INTERRUPTION_FAILED_SAFE", { exact: true })).toBeVisible()
  await expect(page.getByRole("status", { name: "Authoritative next action" })).toContainText("hasilnya tidak pasti")
})

test("orchestration-managed failures send retry review to the Objective", async ({ page }) => {
  await page.goto("/runs")
  await page.getByPlaceholder("Cari Run ID, Task, atau Project...").fill("E2E-ORCH-FAIL")
  await page.getByRole("button", { name: /E2E-ORCH-FAIL.*FAILED/ }).click()

  await expect(page.getByRole("link", { name: "Buka Objective & Restart Subtask" })).toHaveAttribute("href", "/objectives/e2e-objective-dashboard")
  await expect(page.getByRole("button", { name: "Retry Task" })).toHaveCount(0)
  await page.getByRole("link", { name: "Buka Objective & Restart Subtask" }).click()
  await expect(page).toHaveURL(/\/objectives\/e2e-objective-dashboard$/)
})
