import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

function readRuntimeApiToken(): string {
  const runsRoot = process.env.ORCHESTRATOR_RUNS
  if (!runsRoot || !path.isAbsolute(runsRoot)) {
    throw new Error("ORCHESTRATOR_RUNS harus menunjuk runs root absolut saat menjalankan dashboard.")
  }
  const tokenPath = path.join(runsRoot, "runtime", "api-token.json")
  const record = JSON.parse(fs.readFileSync(tokenPath, "utf8")) as { token?: unknown }
  if (typeof record.token !== "string" || record.token.length < 32) {
    throw new Error(`API token runtime tidak valid: ${tokenPath}`)
  }
  return record.token
}

export default defineConfig(({ command }) => {
  const apiToken = command === "serve" ? readRuntimeApiToken() : null
  const dashboardPort = Number(process.env.ORCHESTRATOR_DASHBOARD_PORT || 5173)
  const apiTarget = process.env.ORCHESTRATOR_API_URL || "http://127.0.0.1:3721"
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "127.0.0.1",
      port: dashboardPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          configure(proxy) {
            proxy.on("proxyReq", (proxyRequest) => {
              proxyRequest.setHeader("Authorization", `Bearer ${apiToken}`)
            })
          },
        },
      },
    },
    preview: {
      host: "127.0.0.1",
    },
    resolve: {
      alias: {
        "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
      },
    },
  }
})
