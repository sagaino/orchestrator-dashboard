import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawn } from "node:child_process"

const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "orchestrator-dashboard-e2e-"))
fs.mkdirSync(path.join(runtimeRoot, "runtime"), { recursive: true })
fs.writeFileSync(
  path.join(runtimeRoot, "runtime", "api-token.json"),
  JSON.stringify({ token: "dashboard-e2e-fixture-token-not-for-production" }),
)

const child = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  env: {
    ...process.env,
    ORCHESTRATOR_RUNS: runtimeRoot,
    ORCHESTRATOR_DASHBOARD_PORT: "45173",
    ORCHESTRATOR_API_URL: "http://127.0.0.1:45172",
  },
})

const shutdown = (signal) => {
  if (!child.killed) child.kill(signal)
  fs.rmSync(runtimeRoot, { recursive: true, force: true })
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
child.on("exit", (code) => {
  fs.rmSync(runtimeRoot, { recursive: true, force: true })
  process.exit(code ?? 0)
})
