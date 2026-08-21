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
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3721",
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
