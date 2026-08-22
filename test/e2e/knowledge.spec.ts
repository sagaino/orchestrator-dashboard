import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test("knowledge page renders health, maintenance, and provenance migration workflow", async ({ page }) => {
  await installLifecycleFixtures(page)
  await page.goto("/knowledge")

  await expect(page.getByRole("heading", { name: "Vault Knowledge Health" })).toBeVisible()
  await expect(page.getByText("HEALTHY", { exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "P8.1 Knowledge Maintenance" })).toBeVisible()
  await expect(page.getByText("0 duplicate", { exact: true })).toBeVisible()

  await expect(page.getByRole("heading", { name: "P8.0 Provenance migration" })).toBeVisible()
  await page.getByRole("button", { name: "Buat preview migrasi" }).click()
  await expect(page.getByText("1 halaman", { exact: true })).toBeVisible()
  await expect(page.getByText("2 field berubah", { exact: true })).toBeVisible()

  await page.getByRole("checkbox", { name: "Konfirmasi migrasi provenance" }).check()
  await page.getByRole("button", { name: "Terapkan migrasi dengan rollback" }).click()
  await expect(page.getByText(/Migrasi applied untuk plan/)).toBeVisible()

  await page.getByRole("checkbox", { name: "Konfirmasi rollback provenance" }).check()
  await page.getByRole("button", { name: "Rollback migrasi" }).click()
  await expect(page.getByText("Buat preview migrasi", { exact: true })).toBeVisible()
})
