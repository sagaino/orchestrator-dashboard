import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

let browserErrors: string[] = []

test.beforeEach(async ({ page }) => {
  browserErrors = []
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      browserErrors.push(message.text())
    }
  })
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("response", (response) => {
    if (response.status() >= 400) browserErrors.push(`${response.status()} ${response.url()}`)
  })
  await installLifecycleFixtures(page)
})

test.afterEach(async () => {
  expect(browserErrors, "browser console and page errors").toEqual([])
})

test("intake exposes canonical policy before explicit queue approval", async ({ page }) => {
  await page.goto("/tasks")
  await page.getByRole("combobox").selectOption("e2e-project")
  await page.getByRole("textbox", { name: "Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..." }).fill("Create deterministic fixture")
  await page.getByRole("button", { name: "Generate Canonical Plan" }).click()

  const dialog = page.getByRole("dialog", { name: "Review Canonical Plan" })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText("EXPLICIT HUMAN")
  await expect(dialog).toContainText("src/fixture.ts")
  await expect(dialog).toContainText("typecheck")
  await expect(dialog).toContainText("Fixture change is scoped.")

  await dialog.getByRole("button", { name: "Approve & Queue" }).click()
  await expect(page.getByText("E2E-INTAKE disetujui dan masuk antrean.")).toBeVisible()
  await expect(page.getByText("e2e-intake-job")).toBeVisible()
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
  await dialog.getByRole("checkbox").uncheck()
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
