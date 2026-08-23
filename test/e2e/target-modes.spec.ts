import { expect, test } from "@playwright/test"
import { installLifecycleFixtures } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await installLifecycleFixtures(page)
})

test("Fresh Project mode creates a reviewed objective without queueing work", async ({ page }) => {
  let objectiveRequest: Record<string, unknown> | null = null
  let taskRequestCount = 0
  await page.on("request", (request) => {
    if (request.url().endsWith("/api/objectives") && request.method() === "POST") objectiveRequest = request.postDataJSON()
    if (request.url().endsWith("/api/tasks/request") && request.method() === "POST") taskRequestCount += 1
  })

  await page.goto("/tasks")
  await expect(page.getByRole("button", { name: /Linked Projects/ })).toBeDisabled()
  await page.getByRole("button", { name: /Fresh Project/ }).click()
  await page.getByLabel("Fresh Project ID").fill("e2e-fresh-project")
  await page.getByLabel("Absolute Target Path").fill("/tmp/e2e-fresh-project")
  await page.getByRole("combobox", { name: "Blueprint" }).selectOption("frontend-vite")
  await page.getByRole("textbox", { name: "Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..." }).fill("Create a deterministic fresh project")
  await page.getByRole("button", { name: "Create Fresh Project Objective" }).click()

  await expect(page.getByText(/Fresh Project objective obj-20260822-fresh-fixture dibuat/)).toBeVisible()
  expect(objectiveRequest).toMatchObject({
    mode: "FRESH_PROJECT",
    request: "Create a deterministic fresh project",
    projectIds: ["e2e-fresh-project"],
    freshProject: {
      projectId: "e2e-fresh-project",
      targetDirectory: "/tmp/e2e-fresh-project",
      blueprint: "frontend-vite",
    },
  })
  expect(taskRequestCount).toBe(0)
  await expect(page.getByText("e2e-intake-job")).not.toBeVisible()
})

test("Fresh Project validation remains visible before submission", async ({ page }) => {
  await page.goto("/tasks")
  await page.getByRole("button", { name: /Fresh Project/ }).click()
  await page.getByRole("textbox", { name: "Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..." }).fill("Missing target path")
  await page.getByRole("button", { name: "Create Fresh Project Objective" }).click()

  await expect(page.getByText("Fresh Project ID dan absolute target path wajib diisi.")).toBeVisible()
})
