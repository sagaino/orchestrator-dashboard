import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await installLifecycleFixtures(page)
})

test("Skill Management lists details, usage, provenance, and human enablement control", async ({ page }) => {
  const mutationPaths: string[] = []
  page.on("request", (request) => {
    if (request.method() === "PUT" && request.url().includes("/api/skills/")) mutationPaths.push(new URL(request.url()).pathname)
  })

  await page.goto("/skills")
  await expect(page.getByRole("heading", { name: "Skill Management" })).toBeVisible()
  await expect(page.getByText("diagnostic-review", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Integrity & provenance")).toBeVisible()
  await expect(page.getByText("Plan assignments")).toBeVisible()
  await expect(page.getByText("Installation dan update skill tetap berada di workflow human-confirmed terpisah.")).toBeVisible()

  await page.getByRole("button", { name: "Disable skill" }).click()
  await expect(page.getByRole("dialog", { name: "Disable skill?" })).toBeVisible()
  await page.getByRole("dialog").getByRole("button", { name: "Konfirmasi" }).click()
  await expect(page.getByRole("button", { name: "Enable skill" })).toBeVisible()

  await page.getByRole("button", { name: "Enable skill" }).click()
  await page.getByRole("dialog", { name: "Enable skill?" }).getByRole("button", { name: "Konfirmasi" }).click()
  await expect(page.getByRole("button", { name: "Disable skill" })).toBeVisible()
  expect(mutationPaths).toEqual(["/api/skills/diagnostic-review", "/api/skills/diagnostic-review"])
})
