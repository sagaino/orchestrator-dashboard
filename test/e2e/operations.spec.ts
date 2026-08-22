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

