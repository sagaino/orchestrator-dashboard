import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test("release operations keeps activation behind an explicit human gate", async ({ page }) => {
  await installLifecycleFixtures(page)
  await page.goto("/operations")

  await expect(page.getByRole("heading", { name: "Guarded release" })).toBeVisible()
  await expect(page.getByText("candidate-p64-fixture")).toBeVisible()
  await expect(page.getByText("ACTIVATION_ELIGIBLE", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("HUMAN_GATE_REQUIRED", { exact: true })).toBeVisible()
  const confirm = page.getByRole("checkbox", { name: "Saya memahami aktivasi dilakukan oleh external supervisor" })
  const action = page.getByRole("button", { name: "Siapkan konfirmasi aktivasi" })
  await expect(action).toBeDisabled()
  await confirm.check()
  await expect(action).toBeEnabled()
  await action.click()
  await expect(page.getByRole("status")).toContainText("tidak ada aktivasi yang dijalankan")
})

test("operations exposes backup freshness reminder and restart reconciliation", async ({ page }) => {
  await installLifecycleFixtures(page)
  await page.goto("/operations")

  await expect(page.getByRole("heading", { name: "Restart reconciliation" })).toBeVisible()
  await expect(page.getByRole("region", { name: "Runtime profile" }).getByText("SESUAI", { exact: true })).toBeVisible()
  await expect(page.getByRole("region", { name: "Runtime profile" }).getByText("LOCAL_SAFE", { exact: true })).toBeVisible()
  await expect(page.getByText("COMPLETE", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("backup-schedule", { exact: true })).toBeVisible()
  await expect(page.getByText("Backup schedule belum dipasang; freshness masih bergantung pada backup manual.").first()).toBeVisible()
  await expect(page.getByText("DEGRADED", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("ARTIFACT ONLY", { exact: true })).toBeVisible()
})

test("operations explains a runtime profile mismatch and its safe next action", async ({ page }) => {
  await installLifecycleFixtures(page)
  await page.route("**/api/operations/readiness", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        data: {
          schemaVersion: 1,
          checkedAt: "2026-08-31T08:00:00.000Z",
          status: "BLOCKED",
          admission: { allowed: false, blockers: [{ id: "runtime-profile", code: "RUNTIME_PROFILE_MISMATCH", message: "Profil runtime tidak sesuai.", action: "Nonaktifkan objective intake atau gunakan profil pilot yang sesuai." }] },
          checks: [{ id: "runtime-profile", code: "RUNTIME_PROFILE_MISMATCH", status: "FAIL", severity: "CRITICAL", message: "Profil runtime tidak sesuai.", action: "Nonaktifkan objective intake atau gunakan profil pilot yang sesuai.", runbook: "fixture" }],
          alerts: [],
          signals: {
            runtimeConfig: { schemaVersion: 1, profile: "LOCAL_SAFE", flags: { objectives: true, objectiveScheduler: false, parallelObjectives: false, sameProjectParallel: false, crossProject: false, skills: false, skillAutoRouting: false, telegram: false }, capacity: { maxParallelJobs: 2 }, automation: { approvalMode: "MANUAL", automaticPlanApproval: false, automaticMaterialization: false, automaticDeliveryCertification: false, automaticRecoveryAttempts: 2 } },
            runtimeProfileAlignment: { profile: "LOCAL_SAFE", contractFound: true, aligned: false, severity: "BLOCKER", mismatches: [{ field: "flags.objectives", expected: false, actual: true, severity: "BLOCKER" }], overrides: [] },
          },
        },
      }),
    })
  })

  await page.goto("/operations")

  const profile = page.getByRole("region", { name: "Runtime profile" })
  await expect(profile.getByText("TIDAK SESUAI", { exact: true })).toBeVisible()
  await expect(profile.getByText("flags.objectives", { exact: true })).toBeVisible()
  await expect(profile.getByText(/Tindakan aman: Nonaktifkan objective intake/)).toBeVisible()
})
