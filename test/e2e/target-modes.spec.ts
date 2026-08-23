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
  if (process.env.ORCHESTRATOR_CROSS_PROJECT === "1") {
    await expect(page.getByRole("button", { name: /Linked Projects/ })).toBeEnabled()
  } else {
    await expect(page.getByRole("button", { name: /Linked Projects/ })).toBeDisabled()
  }
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

test("Linked Projects mode uses only registered explicit relationships", async ({ page }) => {
  test.skip(process.env.ORCHESTRATOR_CROSS_PROJECT !== "1", "Run with ORCHESTRATOR_CROSS_PROJECT=1")
  let objectiveRequest: Record<string, unknown> | null = null
  const mutationPaths: string[] = []
  page.on("request", (request) => {
    if (request.url().endsWith("/api/objectives") && request.method() === "POST") objectiveRequest = request.postDataJSON()
    if (request.method() === "POST") mutationPaths.push(new URL(request.url()).pathname)
  })

  await page.goto("/tasks")
  await page.getByRole("button", { name: /Linked Projects/ }).click()
  await page.getByLabel("Primary Project").selectOption("e2e-project")
  await expect(page.getByRole("checkbox", { name: "Link e2e-backend" })).toBeVisible()
  await expect(page.getByText(/CONSUMES_API/)).toBeVisible()
  await expect(page.getByText(/Contract: openapi\.yaml/)).toBeVisible()
  await expect(page.getByText(/Checks: test:contract/)).toBeVisible()
  await page.getByRole("checkbox", { name: "Link e2e-backend" }).check()
  await page.getByRole("textbox", { name: "Deskripsikan fitur, refactor, atau instruksi slicing UI sesuai desain..." }).fill("Diagnose frontend backend contract mismatch")
  await page.getByRole("button", { name: "Create Linked Projects Objective" }).click()

  await expect(page.getByRole("dialog", { name: "Plan Review" })).toBeVisible()
  await expect(page.getByText(/Linked Projects objective e2e-cross-intake dan plan-e2e-cross-intake-r1 siap untuk review/)).toBeVisible()
  expect(objectiveRequest).toMatchObject({
    mode: "CROSS_PROJECT_INCIDENT",
    request: "Diagnose frontend backend contract mismatch",
    projectIds: ["e2e-project", "e2e-backend"],
  })
  expect(mutationPaths).toContain("/api/objectives/e2e-cross-intake/generate-plan")
  expect(mutationPaths).not.toContain("/api/tasks/request")
})

test("Relationship editing requires confirmation and sends an auditable replacement", async ({ page }) => {
  let relationshipRequest: Record<string, unknown> | null = null
  page.on("request", (request) => {
    if (request.url().endsWith("/api/projects/e2e-project/relationships") && request.method() === "PUT") relationshipRequest = request.postDataJSON()
  })

  await page.goto("/")
  await page.getByRole("button", { name: "Manage relationships for e2e-project" }).click()
  const dialog = page.getByRole("dialog", { name: "Project Relationships" })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText("CONSUMES_API")
  await expect(dialog.getByRole("button", { name: "Save Relationships" })).toBeDisabled()
  await dialog.getByRole("checkbox").check()
  await dialog.getByRole("button", { name: "Save Relationships" }).click()
  await expect(dialog).toContainText("Relationship berhasil disimpan dan diaudit.")
  expect(relationshipRequest).toMatchObject({
    confirmed: true,
    relationships: [{ type: "CONSUMES_API", targetProjectId: "e2e-backend", contractPaths: ["openapi.yaml"], verification: ["test:contract"] }],
  })
})
