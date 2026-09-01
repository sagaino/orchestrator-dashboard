import type { Page } from "@playwright/test"

const expectedBrowserNoise = new Set([
  "ResizeObserver loop completed with undelivered notifications.",
  "ResizeObserver loop limit exceeded",
])

export const collectUnexpectedBrowserErrors = (page: Page) => {
  const errors: string[] = []
  const record = (message: string) => {
    if (!expectedBrowserNoise.has(message.trim())) errors.push(message)
  }
  page.on("console", (message) => {
    if (message.type() === "error") record(message.text())
  })
  page.on("pageerror", (error) => record(error.message))
  page.on("response", (response) => {
    if (response.status() >= 400) record(`${response.status()} ${response.url()}`)
  })
  return errors
}
